import { writeFileSync } from "fs";
import { debugLog, productionLog } from "./functions/generics";
import { SocketIOHandler } from "./handlers/socketioHandler";
import { UserInputHandler } from "./handlers/userInputHandler";
import { SECRET_KEY, TENANT_FQDN_NAME } from "./settings";
import { APIStrategy } from "./strategy/apiStrategy";
import { SdnStrategy } from "./strategy/sdn";
import { SessionStrategy } from "./strategy/sessions";
import { IGenericReply, ISessionReply } from "./types/tsessions";
import fs from "fs";

export type endpointType = "sessions" | "users" | "sdn";
export type serviceType = "api" | "s3";

function buildErrorAndReturn(status: number, error: string) {
    const errorToReturn: { status: number; error: string } = {
        status: status,
        error: error
    };
    productionLog(JSON.stringify(errorToReturn), "error");
    process.exit(1);
}

async function main() {

    const tenantFqdnName: string = TENANT_FQDN_NAME;
    //const consumerApiKey: string = CONSUMER_API_KEY; // can this be optional? add a validation if not
    const secretKey: string = SECRET_KEY; // can this be optional? Add a validation if not

    const questionsToAsk: string[] = ['username', 'password', 'domain']

    const error: { status: number; error: string } = {
        error: undefined,
        status: undefined
    };

    if (tenantFqdnName == undefined) {
        buildErrorAndReturn(500, "Tenant fqnd name not defined");
    }

    if (/(^|\s)((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi.test(tenantFqdnName) === false) {
        buildErrorAndReturn(500, "Tenant fqnd name is defined but not format correctly");
    }

    if (secretKey == undefined) {
        // handle user input for login
        // for (const question of questionsToAsk) {
        //     await LoginInterfaceHandler.getInstance().askQuestion(question);
        // }
        buildErrorAndReturn(500, "Secret API key not defined");
    }

    try {
        await SocketIOHandler.getInstance().initSocket();
    } catch (err) {
        buildErrorAndReturn(500, "Error during initialization of socket, maybe tenant fqdn name or consumer api key are not correct" + err?.toString());
    }

    // LocalStorageHandler.getInstance().setLocalStorage();

    // npm run start api sessions create

    const paramsPassedByCli: string[] = process.argv.slice(2);

    // const service: serviceType = paramsPassedByCli[paramsPassedByCli.findIndex(elm => elm === "service") + 1] as serviceType;
    // const endpoint: endpointType = paramsPassedByCli[paramsPassedByCli.findIndex(elm => elm === "endpoint") + 1] as endpointType;
    // const query: string = paramsPassedByCli[paramsPassedByCli.findIndex(elm => elm === "query") + 1];
    const service: serviceType = paramsPassedByCli[0] as serviceType;
    const endpoint: endpointType = paramsPassedByCli[1] as endpointType;
    const entity: string = paramsPassedByCli[2]
    const query: string = paramsPassedByCli[3];
    const optionalFunction: string = paramsPassedByCli[4];

    if (service == undefined || (service != "s3" && service != "api")) {
        buildErrorAndReturn(500, `Error: service ${service} must be define and the value accepted are s3 or api`);
    }

    if (endpoint == undefined || (endpoint != "sessions" && endpoint != "users" && endpoint != "sdn")) {
        buildErrorAndReturn(500, `Error: endpoint ${endpoint} must be define and the value accepted are sessions or users`);
    }

    debugLog("service request " + service, "success", "main");
    debugLog("endpoint request " + endpoint, "success", "main");
    debugLog("query request " + query, "success", "main");

    debugLog("Waiting for user input", "warning", "main");
    let bodyInputFromUser: object;
    try {
        bodyInputFromUser = await UserInputHandler.getInstance().listenForUserInput();
        debugLog("Going to process user request", "success", "main");
    } catch (err) {
        buildErrorAndReturn(500, "Error parsing user input");
    }

    try {
        let strategyToExecute: APIStrategy;
        let result;
        switch (endpoint) {
            case "sessions":
                strategyToExecute = new SessionStrategy(query, bodyInputFromUser, entity);
                result = await strategyToExecute.execute<ISessionReply>();
                productionLog(JSON.stringify(result), "success");
                break;
            case "users":
                // strategyToExecute = new UsersStrategy(query); // to create class
                break;
            case "sdn":
                strategyToExecute = new SdnStrategy(query, bodyInputFromUser, entity);
                result = await strategyToExecute.execute<IGenericReply>();
                productionLog(JSON.stringify(result), "success");
                break;
        }
        if (optionalFunction != undefined) {
            switch (optionalFunction) {
                case "save":
                    if (!fs.existsSync("cmd_results")) {
                        fs.mkdirSync("cmd_results");
                    }
                    writeFileSync(`cmd_results/cmd_results_${endpoint}_${Math.floor(+new Date() / 1000)}.json`, JSON.stringify(result, null, 4))
                    break;
            }
        }
    } catch (err) {
        if (err.response != undefined) {
            // if http request error occurred
            const reply = {
                status: err.response.status,
                error: err.response.data.message
            }
            productionLog(JSON.stringify(reply), "error");
        } else if (err.jobId != undefined) {
            productionLog(JSON.stringify(err), "error");
        }
        process.exit(1);
    }

    // everything goes well
    process.exit(0);
}

main();