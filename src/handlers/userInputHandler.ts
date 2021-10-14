import readline from "readline";

export class UserInputHandler {
    private static instance: UserInputHandler;
    static stdin: NodeJS.Socket;

    private constructor() { }

    public static getInstance(): UserInputHandler {
        if (!UserInputHandler.instance) {
            UserInputHandler.instance = new UserInputHandler();
            this.stdin = process.openStdin();
        }

        return UserInputHandler.instance;
    }

    public listenForUserInput() {
        return new Promise<object>((resolve, reject) => {
            UserInputHandler.stdin.once("data", (data) => {
                // here arrives body
                const dataFromCli = data.toString().trim();
                try {
                    resolve(JSON.parse(dataFromCli));
                } catch (err) {
                    reject(err);
                }
            });
        })
    }
}
