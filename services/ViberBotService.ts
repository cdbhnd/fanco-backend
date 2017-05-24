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
export class ViberBotService implements IBotService {

    private viberBotObjects = [];

    constructor() {
        // not empty
    };
    public async createBot(data: any): Promise<Entities.IBot> {
        let organization: Entities.IOrganization = (await this.getOrganizationRepository().find({ oId: data.organization.toUpperCase() })).shift();
        let bot: Entities.IBot = await this.getBotRepository().create({
            service: data.service,
            name: !!data.name ? data.name : organization.name,
            avatar: !!data.avatar ? data.avatar : this.getViberAvatar(),
            token: data.token,
            organizationId: organization.oId,
            subscribers: [],
            shareableLink: !!data.shareableLink ? data.shareableLink : "",
            verificationToken: !!data.verificationToken ? data.verificationToken : "",
            webhook: config.get("baseUrl") + "/viber/" + data.name,
        });
        await this.initializeBot(bot);
        return bot;
    }

    public async initializeAllBots(): Promise<any> {
        let botRepository = this.getBotRepository();
        let domainViberBots: Entities.IBot[] = await botRepository.find({ service: /^viber$/i });

        for (let i = 0; i < domainViberBots.length; i++) {
            try {
                console.log("Initializing bot " + domainViberBots[i].name);
                this.initializeBot(domainViberBots[i]);
            } catch (e) {
                console.log(e);
            }
        }
    }

    public async initializeBotByName(botName: string): Promise<any> {
        let botRepository = this.getBotRepository();
        let domainViberBot: Entities.IBot = (await botRepository.find({ name: botName })).shift();
        console.log("Viber bot found " + domainViberBot.name);
        this.initializeBot(domainViberBot);
    }

    public getBotObject(botName: string): any {
        let bot = this.viberBotObjects[botName];
        return bot;
    }

    public getViberAvatar(): string {
        return String(config.get("viberService.avatarImage"));
    }

    public async publishEvent(event: Entities.IEvent): Promise<boolean> {

        try {
            for (let i in this.viberBotObjects) {
                if (this.viberBotObjects.hasOwnProperty(i)) {
                    console.log('Nasao Bot-a');
                    console.log(i);
                    let vBot: any = this.viberBotObjects[i];
                    let botRepository = this.getBotRepository();
                    let bot: Entities.IBot = (await botRepository.find({ name: i, service: /^viber$/i })).shift();
                    if (bot) {
                        console.log('Bot pronadjen u bazi ');                    
                    } else {
                        console.log('Bot nije pronadjen u bazi ');
                    }
                    if (bot.organizationId != event.organization) {
                        continue;
                    }
                    console.log('Bot pripada organizaciji');
                    for (let j = 0; j < bot.subscribers.length; j++) {
                        vBot.sendMessage(bot.subscribers[j], new TextMessage(event.content));
                        console.log('Botu poslata poruka');
                    }
                }
            }
        } catch (e) {
            console.log(e);
            return false;
        }
        return true;
    }

    private initializeBot(domainViberBot: Entities.IBot): void {
        const bot = new ViberBot({
            authToken: domainViberBot.token,
            name: domainViberBot.name,
            avatar: domainViberBot.avatar,
        });

        console.log("Viber bot created");

        this.viberBotObjects[domainViberBot.name] = bot;

        console.log("Viber bot registered");

        bot.onTextMessage(/^hi|hello$/i, async (message, response) => {
            let res = await this.addSubscriber(domainViberBot, response.userProfile.id, response.userProfile.name);
            if (res) {
                response.send(new TextMessage(`Hi there ${response.userProfile.name}. I am ${bot.name}`));
            } else {
                response.send(new TextMessage(`Hey ${response.userProfile.name}. I think we've already met ! :)`));
            }
        });

        // duplicated will be removed Serbian
        bot.onTextMessage(/^zdravo|cao$/i, async (message, response) => {
            let res = await this.addSubscriber(domainViberBot, response.userProfile.id, response.userProfile.name);
            if (res) {
                response.send(new TextMessage(`Cao ${response.userProfile.name}. Ja sam ${bot.name} bot`));
            } else {
                response.send(new TextMessage(`Cao ${response.userProfile.name}. Mislim da smo se vec upoznali ! :)`));
            }
        });

        bot.onTextMessage(/^Results|Rezultati|Rez|Rezultat$/i, async (message, response) => {
            let organization = (await this.getOrganizationRepository().find({ oId: domainViberBot.organizationId })).shift();
            let webPagelink = organization.data.resultsUrl;
            let imageLink = await this.getWebPageToImgService().getPageImgByUrl(webPagelink);
            const pictureMessage = new PictureMessage(imageLink);
            response.send(pictureMessage);
        });

        bot.onTextMessage(/^Table|Tabela$/i, async (message, response) => {
            let organization = (await this.getOrganizationRepository().find({ oId: domainViberBot.organizationId })).shift();
            let webPagelink = organization.data.tableUrl;
            let imageLink = await this.getWebPageToImgService().getPageImgByUrl(webPagelink);
            const pictureMessage = new PictureMessage(imageLink);
            response.send(pictureMessage);
        });

        bot.onTextMessage(/^schedule|raspored|Kada igramo|Kad igramo|Kada igramo?|Kad igramo?$/i, async (message, response) => {
            let scheduleRepo = this.getScheduleRepository();
            let currentTimestamp = (new Date()).toISOString();
            let schedules: Entities.ISchedule[] = (await scheduleRepo.find({ $query: { timestamp: { $gt: currentTimestamp }, organizationId: domainViberBot.organizationId }, $orderby: { timestamp: 1 } })).slice(0, 3);
            let scheduleMessage: string = "";

            for (let i = 0; i < schedules.length; i++) {
                let atTimeMessage = this.generateAtWhatTimeMessage(schedules[i].timestamp);
                scheduleMessage = scheduleMessage + atTimeMessage + "\n" + schedules[i].description + "\n\n";

            }
            response.send(new TextMessage(scheduleMessage));
        });

        bot.onTextMessage(/^bye|Bye$/i, async (message, response) => {
            await this.removeSubscriber(domainViberBot, response.userProfile.id, response.userProfile.name);
            response.send(new TextMessage(`Farewell ${response.userProfile.name}. I ll be waiting for you to come back`));
        });

        // duplicated will be removed Serbian
        bot.onTextMessage(/^zbogom|odoh|ajd$/i, async (message, response) => {
            await this.removeSubscriber(domainViberBot, response.userProfile.id, response.userProfile.name);
            response.send(new TextMessage(`Zbogom ${response.userProfile.name}. Vidimo se neki drugi put !`));
        });
        console.log("Viber bot event added");

        domainViberBot.webhook = config.get("baseUrl") + "/viber/" + domainViberBot.name;

        bot.setWebhook(domainViberBot.webhook);

        console.log("Webhook configured");
    }

    private async addSubscriber(botDomain: Entities.IBot, subscriberId: string, subscriberName: string): Promise<boolean> {
        let botRepository = this.getBotRepository();
        let freshDomainBot: Entities.IBot = await botRepository.findOne({ id: botDomain.id });
        if (!this.subscriberExist(freshDomainBot, subscriberId)) {
            freshDomainBot.subscribers.push({ id: subscriberId, name: subscriberName });
            await botRepository.update(freshDomainBot);
            return true;
        }
        return false;
    }

    private async removeSubscriber(botDomain: Entities.IBot, subscriberId: string, subscriberName: string): Promise<boolean> {
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

    private subscriberExist(domainViberBot: Entities.IBot, subscriberId: string): boolean {
        if (!!domainViberBot.subscribers) {
            for (let i = 0; i < domainViberBot.subscribers.length; i++) {
                if (domainViberBot.subscribers[i].id == subscriberId) {
                    return true;
                }
            }
        }
        return false;
    }

    private generateAtWhatTimeMessage(timestamp: string): string {
        let dateObj = momentTz(timestamp).tz("Europe/Belgrade");
        let date = dateObj.format("DD/MM/YYYY");
        let time = dateObj.format("HH:mm");

        let scheduleItemAtTime = date + " u " + time;
        return scheduleItemAtTime;
    }

    private getScheduleRepository(): Repositories.IScheduleRepository {
        return kernel.get<Repositories.IScheduleRepository>(Types.IScheduleRepository);
    }

    private getBotRepository(): Repositories.IBotRepository {
        return kernel.get<Repositories.IBotRepository>(Types.IBotRepository);
    }

    private getOrganizationRepository(): Repositories.IOrganizationRepository {
        return kernel.get<Repositories.IOrganizationRepository>(Types.IOrganizationRepository);
    }

    private getWebPageToImgService(): Services.IWebPageToImgService {
        return kernel.get<Services.IWebPageToImgService>(Types.IWebPageToImgService);
    }
}
