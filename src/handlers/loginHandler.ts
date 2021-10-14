import readline from "readline";

interface IUserInfo {
    username: string;
    password: string;
    domain: string;
}

export class LoginInterfaceHandler {

    private static instance: LoginInterfaceHandler;

    private readLine: readline.Interface;
    private userInformation: IUserInfo;

    constructor() {
        this.userInformation = {
            username: null,
            password: null,
            domain: null
        };
        this.readLine = readline.createInterface(process.stdin, process.stdout);
    }

    public static getInstance(): LoginInterfaceHandler {
        if (!LoginInterfaceHandler.instance) {
            LoginInterfaceHandler.instance = new LoginInterfaceHandler();
        }

        return LoginInterfaceHandler.instance;
    }

    public askQuestion(information: string) {
        return new Promise<void>((resolve, reject) => {
            let questionToAsk = `Insert ${information} -> `;
            if (information == "domain") {
                questionToAsk += "(press enter if not necessary)"
            }

            this.readLine.on('line', (information) => {
                this.userInformation[information] = information;
                resolve();
            })

            this.readLine.setPrompt(questionToAsk);
            this.readLine.prompt();
        })
    }

    public closeReadline(): void {
        this.readLine.close();
    }

    public getQuestions(): IUserInfo {
        return this.userInformation;
    }
}