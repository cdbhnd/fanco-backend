import * as config from "config";
import DropboxClient = require("dropbox");
import { injectable } from "inversify";
import { IDropBoxProvider } from "./IDropBoxProvider";

@injectable()
export class DropBoxProvider implements IDropBoxProvider {

    public async getClient(token: string): Promise<any> {

        return new Promise<any>((resolve, reject) => {
            let access_token:string = config.get("dropbox.access_token").toString();
            let client:any = new DropboxClient({ accessToken: access_token });
            resolve(client);
        });
    }

}