export interface INatRule {
    protocol: "tcp" | "udp" | "icmp";
    ipProtocol: 4 | 6;
    fromExternalPort: number;
    toExternalPort: number;
    toExternalAddr: string;
    fromInternalPort: number;
    toInternalAddr: string;
    description?: string
}

export interface IInternetConnection {
    poolId: string;
    ips: string[];
    mcr_download_speed: number;
    mcr_upload_speed: number;
    pcr_download_speed: number;
    pcr_upload_speed: number
    natRules: INatRule[];
}

export interface IIpNetwork {
    _id?: string;
    enterpriseId: string;
    internetConnections: IInternetConnection[];
}

export interface IPool {
    _id?: string;
    fromIpAddr: string;
    toIpAddr: string;
    netmaskBit: number;
    gatewayIp: string;
    dnsIps: string[];
}

export default interface IIpPool {
    _id?: string;
    ispId: string;
    cidr_block_type: "public" | "private";
    physical_vid: number;
    pools: IPool[];
}

export interface IInternetBackboneSetting {
    _id?: string;
    name: string;
    dcRouterId: string;
    physical_vid: number;
    ip: string;
    netmaskBit: number;
    gateway: string;
    upstream_upload_speed: number;
    upstream_download_speed: number;
    max_pcr_upload_speed: number;
    max_pcr_download_speed: number;
    vendor: string;
}

export interface IAssertNatRule {
    enterpriseId: string;
    natRule: {
        protocol: "tcp" | "udp";
        ipProtocol: 4 | 6;
        fromExternalPort: number;
        toExternalPort: number;
        toInternalAddr: string;
        toExternalAddr: string;
        fromInternalPort: number;
        toInternalPort: number;
        description: string;
    }
}

export interface IRemoveNatRule {
    enterpriseId: string;
    natRule: {
        protocol: "tcp" | "udp";
        ipProtocol: 4 | 6;
        fromExternalPort: number;
        toExternalPort: number;
        toInternalAddr: string;
        toExternalAddr: string;
        fromInternalPort: number;
        toInternalPort: number;
        description: string;
    }
}