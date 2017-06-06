import { IBotService } from "./IBotService";
import * as Repositories from "../repositories/";
import { Types, kernel } from "../infrastructure/dependency-injection/";
import { ValidationException } from "../infrastructure/exceptions/";
import * as Services from "./";
import * as Entities from "../entities/";
import * as config from "config";
import { injectable } from "inversify";
// tslint:disable-next-line:no-var-requires
const ViberBot = require("viber-bot").Bot;
// tslint:disable-next-line:no-var-requires
const BotEvents = require("viber-bot").Events;
// tslint:disable-next-line:no-var-requires
const TextMessage = require("viber-bot").Message.Text;
// tslint:disable-next-line:no-var-requires
const PictureMessage = require("viber-bot").Message.Picture;
// tslint:disable-next-line:no-var-requires
let momentTz = require("moment-timezone");

@injectable()
export abstract class BaseBotService implements IBotService {

    protected actionList = {
        handshake: "handshake",
        webscreenshot: "getWebsiteScreenshot",
        schedule: "getSchedule",
        farewell: "farewell",
        genericText: "genericText"
    };

    public async createBot(data: any): Promise<Entities.IBot> {
        let organization: Entities.IOrganization = (await this.getOrganizationRepository().find({ oId: data.organization.toUpperCase() })).shift();
        let bot: Entities.IBot = await this.createNewBotInstance(data, organization);
        await this.initializeBot(bot);
        return bot;
    }

    protected abstract async createNewBotInstance(data: any, organization: Entities.IOrganization): Promise<Entities.IBot>;

    protected abstract getServiceName(): RegExp;

    public abstract getAvatar(): string;

    public abstract getBotObject(botName: string): any;

    protected abstract getBotObjects(): any[];

    protected abstract publishEventToSubscribers(event: Entities.IEvent, bot: Entities.IBot, botObject: any): void;

    protected abstract initializeBot(domainViberBot: Entities.IBot): void;

    public async initializeAllBots(): Promise<any> {
        let botRepository = this.getBotRepository();
        let domainViberBots: Entities.IBot[] = await botRepository.find({ service: this.getServiceName() });

        for (let i = 0; i < domainViberBots.length; i++) {
            try {
                console.log("Initializing bot " + domainViberBots[i].name);
                await this.initializeBot(domainViberBots[i]);
            } catch (e) {
                console.log(e);
            }
        }
    }

    public async getWebsiteScreenshot(botAction: Entities.IAction): Promise<string> {
        let webPagelink = botAction.data;
        return await this.getWebPageToImgService().getPageImgByUrl(webPagelink);
    }

    public async genericText(botAction: Entities.IAction): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            return botAction.data;
        });
    }

    public async getSchedule(botAction: Entities.IAction, bot: Entities.IBot): Promise<string> {
        let scheduleRepo = this.getScheduleRepository();
        let currentTimestamp = (new Date()).toISOString();
        let schedules: Entities.ISchedule[] = (await scheduleRepo.find({ $query: { timestamp: { $gt: currentTimestamp }, organizationId: bot.organizationId }, $orderby: { timestamp: 1 } })).slice(0, 3);
        let scheduleMessage: string = "";

        for (let i = 0; i < schedules.length; i++) {
            let atTimeMessage = this.generateAtWhatTimeMessage(schedules[i].timestamp);
            scheduleMessage = scheduleMessage + atTimeMessage + "\n" + schedules[i].description + "\n";
        }

        return scheduleMessage;
    }

    public async initializeBotByName(botName: string): Promise<any> {
        let botRepository = this.getBotRepository();
        let domainViberBot: Entities.IBot = (await botRepository.find({ name: botName })).shift();
        console.log("Viber bot found " + domainViberBot.name);
        await this.initializeBot(domainViberBot);
    }

    public async publishEvent(event: Entities.IEvent): Promise<boolean> {
        let botObjects: any[] = this.getBotObjects();
        try {
            for (let i in botObjects) {
                if (botObjects.hasOwnProperty(i)) {
                    let vBot: any = botObjects[i];
                    let botRepository = this.getBotRepository();
                    let bot: Entities.IBot = (await botRepository.find({ name: i, service: this.getServiceName() })).shift();

                    if (bot.organizationId != event.organization) {
                        continue;
                    }
                    this.publishEventToSubscribers(event, bot, vBot);
                }
            }
        } catch (e) {
            console.log(e);
            return false;
        }
        return true;
    }

    public async handshake(botAction: Entities.IAction, bot: Entities.IBot, message: string, response: any): Promise<string> {
        let res: boolean = await this.addSubscriber(bot, response.userProfile.id, response.userProfile.name);
        if (res) {
            return `Zdravo ja sam ${bot.name} bot. Slanjem ovem poruke ste se pretplatili da uživo dobijate najsvežije informacije iz našeg kluba. \n ` +
                `Da biste dobili trenutno stanje na tabeli pošaljite 'tabela'. \n` +
                `Da biste dobili rezultate poslednjeg kola pošaljite 'rez'. \n` +
                `Da biste saznali kada igramo sledeću utakmicu pošaljite 'kad igramo?'. \n` +
                `Ako želite da prestanete da dobijate poruke uživo sa naših utakmica pošaljite 'stop'.`;
        } else {
            return `Zdravo ja sam ${bot.name}. Mislim da smo se vec upoznali !`;
        }
    }

    public async farewell(botAction: Entities.IAction, bot: Entities.IBot, message: string, response: any): Promise<string> {
        await this.removeSubscriber(bot, response.userProfile.id, response.userProfile.name);
        return `Farewell ${response.userProfile.name}. I ll be waiting for you to come back`;
    }

    protected async addSubscriber(botDomain: Entities.IBot, subscriberId: string, subscriberName: string): Promise<boolean> {
        let botRepository = this.getBotRepository();
        let freshDomainBot: Entities.IBot = await botRepository.findOne({ id: botDomain.id });
        if (!this.subscriberExist(freshDomainBot, subscriberId)) {
            freshDomainBot.subscribers.push({ id: subscriberId, name: subscriberName });
            await botRepository.update(freshDomainBot);
            return true;
        }
        return false;
    }

    protected async removeSubscriber(botDomain: Entities.IBot, subscriberId: string, subscriberName: string): Promise<boolean> {
        let botRepository = this.getBotRepository();
        let freshDomainBot: Entities.IBot = await botRepository.findOne({ id: botDomain.id });
        if (!!freshDomainBot.subscribers) {
            for (let i = 0; i < freshDomainBot.subscribers.length; i++) {
                if (freshDomainBot.subscribers[i].id == subscriberId) {
                    freshDomainBot.subscribers.splice(i, 1);
                    await botRepository.update(freshDomainBot);
                    return true;
                }
            }
        }
        return false;
    }

    protected subscriberExist(domainViberBot: Entities.IBot, subscriberId: string): boolean {
        if (!!domainViberBot.subscribers) {
            for (let i = 0; i < domainViberBot.subscribers.length; i++) {
                if (domainViberBot.subscribers[i].id == subscriberId) {
                    return true;
                }
            }
        }
        return false;
    }

    protected generateAtWhatTimeMessage(timestamp: string): string {
        let dateObj = momentTz(timestamp).tz("Europe/Belgrade");
        let date = dateObj.format("DD/MM/YYYY");
        let time = dateObj.format("HH:mm");

        let scheduleItemAtTime = date + " u " + time;
        return scheduleItemAtTime;
    }

    protected getScheduleRepository(): Repositories.IScheduleRepository {
        return kernel.get<Repositories.IScheduleRepository>(Types.IScheduleRepository);
    }

    protected getBotRepository(): Repositories.IBotRepository {
        return kernel.get<Repositories.IBotRepository>(Types.IBotRepository);
    }

    protected getOrganizationRepository(): Repositories.IOrganizationRepository {
        return kernel.get<Repositories.IOrganizationRepository>(Types.IOrganizationRepository);
    }

    protected getWebPageToImgService(): Services.IWebPageToImgService {
        return kernel.get<Services.IWebPageToImgService>(Types.IWebPageToImgService);
    }

    protected getBotActionsRepository(): Repositories.IBotActionsRepository {
        return kernel.get<Repositories.IBotActionsRepository>(Types.IBotActionsRepository);
    }
}
