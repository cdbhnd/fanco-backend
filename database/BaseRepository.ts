import { DB } from "./DB";
import * as mongodb from "mongodb";
import { injectable } from "inversify";
import * as config from "config";

@injectable()
export class BaseRepository<T> {
    protected db: mongodb.Db;
    private entityName: string;

    constructor(entityName: string) {
        // DB.init();
        this.entityName = entityName;
        this.db = DB.db;
    }

    public async find(query: any): Promise<T[]> {
        // await this.connectToDb();
        this.normalizeSearchQuery(query);
        let result = await DB.db.collection(this.entityName).find(query).toArray();
        if (!!result && !!result.length) {
            for (let i = 0; i < result.length; i++) {
                if (!!result[i]._id) {
                    result[i].id = this.serializeObjectId(result[i]._id);
                    delete result[i]._id;
                }
            }
        }
        return result;
    }

    public async findOne(query: any): Promise<T> {
        this.normalizeSearchQuery(query);
        let result = await DB.db.collection(this.entityName).findOne(query);
        if (!!result) {
            if (!!result._id) {
                result.id = this.serializeObjectId(result._id);
                delete result._id;
            }
        }
        return result;
    }

    public async findAll(): Promise<T[]> {
        return await this.find({});
    }

    public async create(entity: T): Promise<T> {
        let result = await this.collection().insertOne(entity);
        if (!!result && !!result.ops && !!result.ops.length) {
            if (!!result.ops[0]._id) {
                result.ops[0].id = this.serializeObjectId(result.ops[0]._id);
                delete result.ops[0]._id;
            }
            return result.ops[0];
        }
        return null;
    }

    public async update(entity: T): Promise<T> {
        let objt = entity as any;

        let objId = this.deserializeObjectId(objt.id);

        let result = await this.collection().updateOne({ _id: objId }, { $set: objt });

        let updatedDoc = await this.collection().findOne({ _id: objId });

        if (!!updatedDoc) {
            if (!!updatedDoc._id) {
                updatedDoc.id = this.serializeObjectId(updatedDoc._id);
                delete updatedDoc._id;
            }
        }

        return updatedDoc;
    }

    public async delete(entity: T): Promise<Boolean> {

        let objt = entity as any;

        let objId = this.deserializeObjectId(objt.id);

        await this.collection().deleteOne({ _id: objId });

        return true;
    }

    protected collection(): mongodb.Collection {
        return this.db.collection(this.entityName);
    }

    protected normalizeSearchQuery(query: any): any {
        if (!query) {
            query = {};
        }
        if (!!query.id) {
            query._id = this.deserializeObjectId(query.id);
            delete query.id;
        }
        return query;
    }

    protected serializeObjectId(objId: mongodb.ObjectID): string {
        if (!!objId) {
            return objId.toString();
        }
        return "";
    }

    protected deserializeObjectId(objectId: string): mongodb.ObjectID {
        if (!!objectId) {
            try {
                return new mongodb.ObjectID(objectId);
            } catch (e) {
                return null;
            }
        }
        return null;
    }

    private async connectToDb(): Promise<boolean> {
        if (!this.db) {
            this.db = await mongodb.MongoClient.connect("mongodb://" + config.get("mongoDbSettings.dbUser") + ":" + config.get("mongoDbSettings.dbPassword") + "@ds159220.mlab.com:59220/fanco");
        }
        return true;
    }
}
