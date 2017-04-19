export interface IViberBotService {
    initializeAllBots(): Promise<any>;
    initializeBotByName(botName: string): Promise<any>;
    getViberBotObject(botName: string): any;
}
