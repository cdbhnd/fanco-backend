import { IEvent } from "../entities/";
import * as Entities from "../entities/";

export interface IBotService {
    createBot(data: any): Promise<Entities.IBot>;
    initializeAllBots (): Promise<any>;
    getBotObject(botName: string): any;
    publishEvent(event: IEvent): Promise<boolean>;
}
