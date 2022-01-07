import { getSessionMetadata, httpRequest } from "../functions/generics";
import { SocketIOHandler } from "../handlers/socketioHandler";
import { ICreateSessionBody, IEditSessionBody, IFilterBodyParam, IGetAllReply, ISessionReply, ISessionSession } from "../types/tsessions";
import { APIStrategy } from "./apiStrategy";

export class SessionStrategy extends APIStrategy {

    /**
    * Get multiple or single session
    *
    * @function get
    */
    private async get(): Promise<IGetAllReply<ISessionSession>> {
        const bodyReceived: IFilterBodyParam = this.bodyInputFromUser as IFilterBodyParam;

        let queryParams: string;

        if (Object.keys(bodyReceived).length > 0) {
            queryParams = "";

            const isRequestById = Object.keys(bodyReceived).find(elm => elm === "id") !== undefined;

            if (isRequestById === false) {
                for (let idx = 0; idx < Object.keys(bodyReceived).length; idx++) {
                    const key = Object.keys(bodyReceived)[idx];
                    const value = bodyReceived[key];
                    if (idx === 0) {
                        queryParams += "?"
                    }
                    queryParams += key + "=" + value
                    if (idx !== Object.keys(bodyReceived).length - 1) {
                        queryParams += "&"
                    }
                }
            } else {
                queryParams += `/${bodyReceived.id}`
            }
        }

        const getSessionsRequest = await httpRequest("get", queryParams == undefined ? `api/v1/session/sessions` : `api/v1/session/sessions${queryParams}`);
        return { status: getSessionsRequest.status, statusText: getSessionsRequest?.statusText, body: getSessionsRequest["data"] }
    }

    /**
    * Create session; the body expected is of type ICreateSessionBody
    *
    * @function create
    */
    private async create(): Promise<ISessionReply> {
        const bodyReceived: ICreateSessionBody = this.bodyInputFromUser as ICreateSessionBody;
        const createSessionRequest = await httpRequest("post", "api/v1/session/sessions", bodyReceived);
        const jobId: string = createSessionRequest.data["job_id"];
        return await SocketIOHandler.getInstance().addJobAndWait(jobId);
    }

    /**
    * Start session; the body expected is the id of the session to start
    *
    * @function start
    */
    private async start(): Promise<ISessionReply> {
        const bodyReceived: { id: string } = this.bodyInputFromUser as { id: string };
        const startSessionRequest = await httpRequest("post", `api/v1/session/sessions/${bodyReceived.id}/start`);
        const jobId: string = startSessionRequest.data["job_id"];
        return await SocketIOHandler.getInstance().addJobAndWait(jobId);
    }

    /**
    * Delete session; the body expected is the id of the session to delete
    *
    * @function delete
    */
    private async delete(): Promise<ISessionReply> {
        const bodyReceived: { id: string } = this.bodyInputFromUser as { id: string };
        const deleteSessionRequest = await httpRequest("delete", `api/v1/session/sessions/${bodyReceived.id}`);
        const jobId: string = deleteSessionRequest.data["job_id"];
        return await SocketIOHandler.getInstance().addJobAndWait(jobId);
    }

    /**
    * Edit session; the body expected is the id of type IEditSessionBody
    *
    * @function delete
    */
    private async edit(): Promise<ISessionReply> {
        const bodyReceived: IEditSessionBody = this.bodyInputFromUser as IEditSessionBody;
        const sessionInfo = await getSessionMetadata(bodyReceived.id);
        const editSessionRequest = await httpRequest("put", `api/v1/session/sessions/metadata/${bodyReceived.id}?runConfigBootstrap=${false}&applyChangesLive=${false}`, bodyReceived, sessionInfo.etag);
        const jobId: string = editSessionRequest.data["job_id"];
        return await SocketIOHandler.getInstance().addJobAndWait(jobId);
    }

    /**
    * Stop session; the body expected is the id of the session to stop
    *
    * @function stop
    */
    private async stop(): Promise<ISessionReply> {
        const bodyReceived: { id: string; force?: boolean } = this.bodyInputFromUser as { id: string; force?: boolean };
        const lastPartOfQuery = bodyReceived.force == undefined || bodyReceived.force === false ? "stop" : "forced_stop";
        const stopSessionRequest = await httpRequest("post", `api/v1/session/sessions/${bodyReceived.id}/${lastPartOfQuery}`);
        const jobId: string = stopSessionRequest.data["job_id"];
        return await SocketIOHandler.getInstance().addJobAndWait(jobId);
    }

    public async execute<T>(): Promise<T> {
        switch (this.query) {
            case "get":
                return await this.get() as unknown as T;
            case "create":
                return await this.create() as unknown as T;
            case "start":
                return await this.start() as unknown as T;
            case "delete":
                return await this.delete() as unknown as T;
            case "edit":
                return await this.edit() as unknown as T;
            case "stop":
                return await this.stop() as unknown as T;
            default:
                throw new Error("Query not handled " + this.query)
        }
    }
}