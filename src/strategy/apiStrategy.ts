export abstract class APIStrategy {

    constructor(protected query: string, protected bodyInputFromUser: any, protected entity: string) {
        this.query = query;
        this.bodyInputFromUser = bodyInputFromUser;
        this.entity = entity;
    }

    public abstract execute<T>(): Promise<T>;
}