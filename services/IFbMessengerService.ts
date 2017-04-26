import { IEvent } from "../entities/";

export interface IFbMessengerService {
    initializeAllBots(): Promise<any>;
    getFbMessengerBotObject(botName: string): any;
   // publishEvent(event: IEvent): Promise<boolean>;
}
