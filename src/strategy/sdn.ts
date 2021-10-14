import { debugLog, httpRequest } from "../functions/generics";
import { SocketIOHandler } from "../handlers/socketioHandler";
import IIpPool, { IAssertNatRule, IInternetConnection, IIpNetwork, INatRule, IPool, IRemoveNatRule } from "../types/tsdn";
import { IGenericReply, ISessionReply } from "../types/tsessions";
import { APIStrategy } from "./apiStrategy";
import _ from "lodash";

export class SdnStrategy extends APIStrategy {

    private returnPromiseToWaitForJobs = (jobIds: string[]) => {
        const promisesToWait = jobIds.reduce((acc, curr) => {
            acc.push(SocketIOHandler.getInstance().addJobAndWait(curr))
            return acc
        }, [])
        return promisesToWait;
    }

    private async assignPublicIps(): Promise<IGenericReply> {
        const bodyReceived = this.bodyInputFromUser as { quantity: number; cidr_block_type: "public" | "private"; enterpriseId: string };
        /** Body expected is
         * {
                "numIpRequested": 2,
                "cidr_block_type": "public",
                "enterpriseId": "---"
            }
        */
        const ipNetworkOfEnterprise = (await httpRequest("get", `api/v1/network/${this.entity}?enterpriseId=${bodyReceived.enterpriseId}`))["data"]["ip_networks"] as IIpNetwork[];
        const assignPublicIpRequest = await httpRequest("post", `api/v1/network/${this.entity}/${ipNetworkOfEnterprise[0]._id}/assign_pool_ip_by_cidr?updateFirewall=true`, { numIpRequested: bodyReceived.quantity, cidr_block_type: bodyReceived.cidr_block_type });
        return { status: assignPublicIpRequest.status, statusText: assignPublicIpRequest?.statusText }
    }

    private async removeNatRule(): Promise<IGenericReply | ISessionReply | ISessionReply[]> {

        const bodyReceived: IRemoveNatRule = this.bodyInputFromUser as IRemoveNatRule;
        const ipNetworkOfEnterpriseRequest = await httpRequest("get", `api/v1/network/${this.entity}?enterpriseId=${bodyReceived.enterpriseId}`);
        const ipNetworkOfEnterprise: IIpNetwork = (ipNetworkOfEnterpriseRequest["data"]["ip_networks"] as IIpNetwork[])[0];

        const ipNetworkOfEntReq = (await httpRequest("get", `api/v1/network/${this.entity}/${ipNetworkOfEnterprise._id}`))
        const ipNetwork = ipNetworkOfEntReq.data as IIpNetwork;
        const etag = ipNetworkOfEntReq.headers.etag;

        const indexOfInternetConnection = ipNetwork.internetConnections.findIndex(elm => elm.natRules.find(elm => {
            delete elm["_id"]
            return _.isEqual(elm, bodyReceived.natRule)
        }));
        
        if (indexOfInternetConnection == -1) {
            const reply: IGenericReply = {
                status: 500,
                statusText: "No internet connection find with this nat rule"
            }
            return reply;
        }

        ipNetwork.internetConnections[indexOfInternetConnection].natRules.splice(ipNetwork.internetConnections[indexOfInternetConnection].natRules.findIndex(elm => _.isEqual(elm, bodyReceived.natRule)), 1);

        const response = await httpRequest("put", `api/v1/network/${this.entity}/${ipNetwork._id}?updateFirewall=true`, ipNetwork, etag);

        const jobIds: string[] = response.data["job_ids"];
        const replies: ISessionReply[] = await Promise.all(this.returnPromiseToWaitForJobs(jobIds));
        return replies[0]
    }

    private async assertNatRule(): Promise<IGenericReply | ISessionReply | ISessionReply[]> {

        try {
            const bodyReceived: IAssertNatRule = this.bodyInputFromUser as IAssertNatRule;
            const ipNetworkOfEnterpriseRequest = await httpRequest("get", `api/v1/network/${this.entity}?enterpriseId=${bodyReceived.enterpriseId}`);
            const ipNetworkOfEnterprise: IIpNetwork = (ipNetworkOfEnterpriseRequest["data"]["ip_networks"] as IIpNetwork[])[0];
            const internetConnections: IInternetConnection[] = ipNetworkOfEnterprise.internetConnections;
            const poolIds: string[] = internetConnections.map(elm => elm.poolId);
            const publicPools: string[] = [];

            /**
            * Return a single public ip by checking the nat rules and the actual public ips in use of the enterprise
            *
            * @function getFreeIpToUse
            * @param {INatRule[]} natRules - nat rules currently in use by the company
            */
            const getFreeIpToUse = (natRules: INatRule[], ipsInUse: string[]) => {
                for (const ip of ipsInUse) {
                    const natRulesByExternalAddress = natRules.filter(elm => elm.toExternalAddr);
                    if (natRulesByExternalAddress.length === 0) {
                        return ip;
                    } else {
                        for (const natRuleByExtAddr of natRulesByExternalAddress) {
                            if ((natRuleByExtAddr.protocol === bodyReceived.natRule.protocol) && (natRuleByExtAddr.toExternalPort === bodyReceived.natRule.toExternalPort)) {
                                return undefined;
                            }
                        }
                    }
                    return ip
                }
                return undefined;
            }

            /**
            * Return a an object of made by poolId, isIpPoolDefined, ipToUse
            * If the enterprise does not have any public pool, it means that the enterprise does not have any public ip. For this 
            * reason it is necessary to assign a new public pool and that means add an internet connection object inside the internet connections array of the ip network of the enterprise
            *
            * @function findFreePublicIp
            */
            const findFreePublicIp = async (): Promise<{ poolId?: string; isIpPoolDefined?: boolean; ipToUse: string; }> => {

                let isIpPoolDefined: boolean = false;

                const poolAndIpState: { poolId?: string; isIpPoolDefined?: boolean; ipToUse: string; } = {
                    ipToUse: undefined,
                    isIpPoolDefined: undefined,
                    poolId: undefined
                }

                if ((this.bodyInputFromUser as IAssertNatRule).natRule.toExternalAddr != undefined) {
                    poolAndIpState.ipToUse = (this.bodyInputFromUser as IAssertNatRule).natRule.toExternalAddr;
                    return poolAndIpState;
                }

                for (const poolId of poolIds) {
                    const ipPools: IIpPool[] = (await httpRequest("get", `api/v1/network/ip_pools/?poolId=${poolId}&cidr_block_type=public`))["data"]["ip_pools"] as IIpPool[];
                    if (ipPools.length === 0) {
                        poolAndIpState.poolId = undefined;
                        poolAndIpState.isIpPoolDefined = false;
                        poolAndIpState.ipToUse = undefined;
                    } else {
                        publicPools.push(poolId);

                        poolAndIpState.isIpPoolDefined = true;

                        const internetConnectionForPool = internetConnections.find(elm => elm.poolId === poolId);
                        const ipsInUse: string[] = internetConnectionForPool.ips;
                        const natRulesInUse: INatRule[] = internetConnectionForPool.natRules;

                        const ipToUse: string = getFreeIpToUse(natRulesInUse, ipsInUse);

                        if (ipToUse != undefined) {
                            poolAndIpState.poolId = poolId;
                            poolAndIpState.isIpPoolDefined = isIpPoolDefined;
                            poolAndIpState.ipToUse = ipToUse;
                            return poolAndIpState;
                        }
                    }
                }

                return poolAndIpState;
            }

            /**
            * Add a new public ip using a pool id
            *
            * @function assignNewPublicIpWithPool
            * @param {string} poolId - poolId is the mongodb id of pool you want to add the public ip
            */
            const assignNewPublicIpWithPool = async (poolId: string): Promise<string> => {
                const actualNumberOfIps = ipNetworkOfEnterprise.internetConnections.find(elm => elm.poolId === poolId).ips.length;
                const response = (await httpRequest("post", `api/v1/network/${this.entity}/${ipNetworkOfEnterprise._id}/assign_public_ip/${poolId}?updateFirewall=false`, { numIpRequested: actualNumberOfIps + 1, cidr_block_type: "public" }));
                //const jobIds: string[] = response.data["job_ids"];
                //await Promise.all(returnPromiseToWaitForJobs(jobIds));
                return response.data["publicIpsAssigned"][0]
            }

            /**
            * Add a new public ip using a pool id
            *
            * @function updateIpNetwork
            * @param {string} pubIp - pubIp is the public ip of the nat rule you want to add
            * @param {string} poolId - poolId (optional): if specified, updates the nat rule of that ip network
            */
            const updateIpNetwork = async (pubIp: string, poolId?: string) => {

                const ipNetworkOfEntReq = (await httpRequest("get", `api/v1/network/${this.entity}/${ipNetworkOfEnterprise._id}`))
                const ipNetwork = ipNetworkOfEntReq.data as IIpNetwork;
                const etag = ipNetworkOfEntReq.headers.etag;

                ipNetwork.internetConnections.find(elm => elm.poolId === (publicIpToUse.poolId === undefined ? poolId : publicIpToUse.poolId)).natRules.push({
                    fromExternalPort: bodyReceived.natRule.fromExternalPort,
                    fromInternalPort: bodyReceived.natRule.fromInternalPort,
                    ipProtocol: bodyReceived.natRule.ipProtocol,
                    protocol: bodyReceived.natRule.protocol,
                    toExternalAddr: pubIp,
                    toExternalPort: bodyReceived.natRule.toExternalPort,
                    toInternalAddr: bodyReceived.natRule.toInternalAddr,
                    description: bodyReceived.natRule.description
                });

                const response = await httpRequest("put", `api/v1/network/${this.entity}/${ipNetwork._id}?updateFirewall=true`, ipNetwork, etag);

                const jobIds: string[] = response.data["job_ids"];
                const replies: ISessionReply[] = await Promise.all(this.returnPromiseToWaitForJobs(jobIds));
                return replies[0]
            }

            /**
            * Call this function to automatically assign a new public ip and a new public ip address
            *
            * @function assignAutomaticallyPublicIpAndPool
            */
            const assignAutomaticallyPublicIpAndPool = async () => {

                const assignPublicIpRequest = await httpRequest("post", `api/v1/network/${this.entity}/${ipNetworkOfEnterprise._id}/assign_pool_ip_by_cidr?updateFirewall=false`, { numIpRequested: 1, cidr_block_type: "public" });
                //const jobIds: string[] = assignPublicIpRequest.data["job_ids"];
                //await Promise.all(returnPromiseToWaitForJobs(jobIds));
                return await updateIpNetwork(assignPublicIpRequest.data["publicIpsAssigned"][0], assignPublicIpRequest.data["pool_id"]);
            }

            // Begin the logic to assert a nat rule
            const publicIpToUse = await findFreePublicIp();

            if (publicIpToUse.ipToUse != undefined) {
                return await updateIpNetwork(publicIpToUse.ipToUse);
            }

            if (publicIpToUse.isIpPoolDefined === false) {
                return await assignAutomaticallyPublicIpAndPool();
            } else {
                if (publicIpToUse.ipToUse == undefined) {
                    for (let idx = 0; idx < publicPools.length; idx++) {
                        try {
                            const newPublicIp = await assignNewPublicIpWithPool(publicPools[idx]); // http call return an error it there is one (403,404,500...)
                            // call update ip network to add nat rule
                            return await updateIpNetwork(newPublicIp, publicPools[idx]);
                        } catch (err) {
                            if (idx === publicPools.length - 1) {
                                return await assignAutomaticallyPublicIpAndPool();
                            }
                        }
                    }
                }
            }
        } catch (err) {
            debugLog(err?.toString(), "error", "assertNatRule")
        }
    }

    public async execute<T>(): Promise<T> {
        switch (this.query) {
            case "assignPublicIps":
                return await this.assignPublicIps() as unknown as T;
            case "assertNatRule":
                return await this.assertNatRule() as unknown as T;
            case "removeNatRule":
                return await this.removeNatRule() as unknown as T;
            default:
                throw new Error("Query not handled " + this.query)
        }
    }
}