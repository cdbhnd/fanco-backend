export interface IDropBoxProvider {
    getClient(token: string): Promise<any>;
}