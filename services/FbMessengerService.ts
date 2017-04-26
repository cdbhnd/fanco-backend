import { IFbMessengerService } from "./IFbMessengerService";
import * as Repositories from "../repositories/";
import { Types, kernel } from "../infrastructure/dependency-injection/";
import { ValidationException } from "../infrastructure/exceptions/";
import * as Entities from "../entities/";
import * as config from "config";
import { injectable } from "inversify";
import { Bot, Elements } from "facebook-messenger-bot";

@injectable()
export class FbMessengerService implements IFbMessengerService {

    private fbMessengerBots = [];

    constructor() {
        // not empty
    };

    public async initializeAllBots(): Promise<any> {
        let botRepository = this.getBotRepository();
        let domainBots: Entities.IBot[] = await botRepository.find({ service: "FbMessenger" });

        for (let i = 0; i < domainBots.length; i++) {
            try {
                console.log("Initializing bot " + domainBots[i].name);
                this.initializeBot(domainBots[i]);
            } catch (e) {
                console.log(e);
            }
        }
    }

    public async initializeBotByName(domainBot: Entities.IBot): Promise<any> {
        let botRepository = this.getBotRepository();
        let domainViberBot: Entities.IBot = (await botRepository.find({ name: domainBot })).shift();
        console.log("Facebook Messenger bot found " + domainBot);
        this.initializeBot(domainBot);
    }

    public getFbMessengerBotObject(botName: string): any {
        let bot = this.fbMessengerBots[botName];
        return bot;
    }

    private initializeBot(domainBot: Entities.IBot): void {
        const bot = new Bot(domainBot.token, domainBot.fbVerificationToken);

        console.log("Facebook Messenger bot created !");

        this.fbMessengerBots[domainBot.name] = bot;

        console.log("Facebook Messenger bot registered");

        // on message
        bot.on("message", async (message) => {
            const { sender } = message;
            await sender.fetch("first_name");

            const out = new Elements();
            out.add({ text: `hey ${sender.first_name}, how are you!` });

            await bot.send(sender.id, out);
        });
        console.log("Viber bot event added");
    }

    private getScheduleRepository(): Repositories.IScheduleRepository {
        return kernel.get<Repositories.IScheduleRepository>(Types.IScheduleRepository);
    }

    private getBotRepository(): Repositories.IBotRepository {
        return kernel.get<Repositories.IBotRepository>(Types.IBotRepository);
    }
}
