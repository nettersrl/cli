import axios, { AxiosResponse, Method } from 'axios';
import { TENANT_FQDN_NAME, SECRET_KEY } from '../settings';
import { ISessionMetadata, ISessionSession } from '../types/tsessions';

export async function httpRequest(method: Method, url: string, body?: object, etag?: string, additionalHeaderInfo?: Object) {

    const headers = {
        'X-Netter-Auth-Type': 'secret_user_key',
        'Authorization': `Bearer ${SECRET_KEY}`
    }

    if (additionalHeaderInfo != undefined) {
        Object.assign(headers, additionalHeaderInfo);
    }

    const reqUrl: string = `https://api.${TENANT_FQDN_NAME}/${url}`;

    let reply: AxiosResponse<any>;
    switch (method) {
        case "get":
            reply = await axios.get(reqUrl, {
                headers: headers
            })
            break;
        case "put":
            headers["If-Match"] = etag;
            reply = await axios.put(reqUrl, body, {
                headers: headers
            })
            break;
        case "post":
            reply = await axios.post(reqUrl, body, {
                headers: headers
            })
            break;
        case "delete":
            reply = await axios.delete(reqUrl, {
                headers: headers
            })
            break;
    }
    return reply
}

export async function getSessionMetadata(pgSessionId: string) {

    const getSessionRequest = await httpRequest("get", `api/v1/session/sessions/${pgSessionId}`);
    const session = getSessionRequest.data as ISessionSession;

    const mozartSessionRequest = await axios.get(`https://api.ferrari.netter.io/api/v1/session/sessions/metadata/${session.id}`, {
        headers: { 'X-Netter-Auth-Type': 'microservice', 'content-type': 'application/json' },
        timeout: 10000
    });

    if (mozartSessionRequest.status != 200) {
        throw new Error("Request internal error");
    }

    const etag = mozartSessionRequest.headers.etag;
    const sessionMetadata = mozartSessionRequest.data as ISessionMetadata;

    return { sessionMetadata: sessionMetadata, etag: etag }
}

export function debugLog(message: string, type: "error" | "warning" | "success", functionInScope?: string): void {
    if (process.env.DEBUG != "true") return
    let color = "";
    switch (type) {
        case "error":
            color = "\x1b[31m";
            break
        case "success":
            color = "\x1b[32m";
            break;
        case "warning":
            color = "\x1b[33m";
            break;
    }
    functionInScope == null ? console.log(color, `[DEBUG] -> ${message}`) : console.log(color, `[DEBUG] -> [${functionInScope.toUpperCase()}] -> ${message}`);
}

export function productionLog(message: string, type: "error" | "warning" | "success"): void {
    if (type === "error") {
        console.error(`${message}`)
    } else {
        console.log(`${message}`);
    }
}