import * as mongodb from "mongodb";
import * as config from "config";

export class DB {
    public static dbDriver = mongodb;
    public static db: mongodb.Db;

    public static async init(): Promise<boolean> {
        DB.db = await DB.dbDriver.MongoClient.connect("mongodb://" + config.get("mongoDbSettings.dbUser") + ":" + config.get("mongoDbSettings.dbPassword") + "@ds049641.mlab.com:49641/pbox");
        return true;
    }
}
