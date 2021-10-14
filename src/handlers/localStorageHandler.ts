import LocalStorage from "node-localstorage";

export class LocalStorageHandler {
    private static instance: LocalStorageHandler;
    private localStorage: LocalStorage.LocalStorage;

    public static getInstance(): LocalStorageHandler {
        if (!LocalStorageHandler.instance) {
            LocalStorageHandler.instance = new LocalStorageHandler();
        }

        return LocalStorageHandler.instance;
    }

    /**
    * Call this function after initialize Singleton
    *
    * @function setLocalStorage
    */
    public setLocalStorage(): void {
        this.localStorage = new LocalStorage.LocalStorage('./scratch');
    }

    public getLocalStorage(): LocalStorage.LocalStorage {
        return this.localStorage;
    }

    /**
    * Set key and value in local storage
    *
    * @function setKeyValue
    * @param {string} key - key of value to set
    * @param {string} value - the value of the key
    */
    public setKeyValue(key: string, value: string): void {
        this.localStorage.setItem(key, value);
    }

    /**
    * Set key and value in local storage
    *
    * @function getValueOfKey
    * @param {string} key - get the value of a key
    */
    public getValueOfKey(key: string): string {
        return this.localStorage.getItem(key);
    }
}
