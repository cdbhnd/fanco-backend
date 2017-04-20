import { IEvent } from "../entities/";

export interface IViberBotService {
    initializeAllBots(): Promise<any>;
    initializeBotByName(botName: string): Promise<any>;
    getViberBotObject(botName: string): any;
    publishEvent(event: IEvent): Promise<boolean>;
}
