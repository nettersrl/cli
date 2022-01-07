import { io, Socket } from 'socket.io-client';
import { debugLog } from '../functions/generics';
import { SECRET_KEY, TENANT_FQDN_NAME } from '../settings';
import { ISessionReply } from '../types/tsessions';

export class SocketIOHandler {
    private static instance: SocketIOHandler;

    private socket: Socket;
    private jobs: { id: string; promiseOut: { resolve: Function; reject: Function; promise: Promise<ISessionReply> } }[] = [];

    public async initSocket(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            debugLog("going to init socket", "warning", "socket handler");
            this.jobs = [];
            // tenantFqdnName example is ferrari.netter.io (alias of pg collection enterprise_aliases)
            this.socket = io(`https://api.${TENANT_FQDN_NAME}/enterprises`, {
                transports: ["websocket"],
                auth: {
                    type: "secret_user_key",
                    token: SECRET_KEY
                },
                forceNew: false
            });
            this.socket.on("connect", () => {
                debugLog("connected "+this.socket.id, "success", "socket handler");
                resolve();
            });
            this.socket.on("notification", (notification: { message: string, exit_code: "failed" | "completed" }) => {
                const notificationMessage = JSON.parse(notification.message) as ISessionReply;
                const job = this.jobs.find(elm => elm.id === notificationMessage.jobId)
                if (job != undefined) {
                    notificationMessage["exit_code"] = notification.exit_code;
                    notification.exit_code === "completed" ? job.promiseOut.resolve(notificationMessage) : job.promiseOut.reject(notificationMessage);
                }
            });
            this.socket.on("connect_error", (error) => {
                debugLog("Connection error "+error?.toString(), "error", "socket handler");
                reject();
            });
            this.socket.on("connect_timeout", (timeout) => {
                debugLog("Connection timeout ", "warning", "socket handler");
                reject();
            });
            this.socket.on("error", (error) => {
                debugLog("Connection error "+error?.toString(), "error", "socket handler");
                reject();
            });
        });
    }

    private createOutsidePromise(): { resolve: Function; reject: Function; promise: Promise<ISessionReply> } {
        let res, rej;
        const promise = new Promise<ISessionReply>((resolve, reject) => {
            res = resolve;
            rej = reject;
        })
        return {
            resolve: res,
            reject: rej,
            promise: promise
        }
    }

    public async addJobAndWait(jobId: string): Promise<ISessionReply> {
        const promise = this.createOutsidePromise()
        this.jobs.push({ id: jobId, promiseOut: promise });
        return await promise.promise;
    }

    public static getInstance(): SocketIOHandler {
        if (!this.instance) {
            this.instance = new SocketIOHandler();
        }
        return this.instance;
    }
}