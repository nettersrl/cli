import { TENANT_FQDN_NAME } from "../settings";

export class AuthenticationHandler {

    private loginUrl: string;
    private tokenUrl: string;
    private validateTokenUrl: string;

    constructor(protected protocol: "http" | "https") {
        this.protocol = protocol;
        this.loginUrl = this.protocol + "/" + TENANT_FQDN_NAME + "/auth/login";
    }
}