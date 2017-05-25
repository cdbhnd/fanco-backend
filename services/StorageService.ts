import { IStorageService } from "./IStorageService";
import { IOrganization } from "../entities/";
import { Check } from "../utility/Check"
import * as cloudinary from "cloudinary";
import { injectable } from "inversify";

@injectable()
export class StorageService implements IStorageService {

    public async uploadFile(url: string, organization: IOrganization): Promise<string> {

        Check.notNull(url, "url");
        Check.notNull(organization, "organization");

        return new Promise<string>((resolve, reject) => {
            if (!!organization.data.cloudinary_name) {
                cloudinary.config({ 
                    cloud_name: organization.data.cloudinary_name, 
                    api_key: organization.data.cloudinary_key, 
                    api_secret: organization.data.cloudinary_secret 
                });
                cloudinary.uploader.upload(url, function(result) { 
                    if (result.error) {
                        reject(result.error);
                    } else {
                        resolve(result.secure_url);
                    }
                });
            } else {
                resolve(url);
            }
        });
    }
}