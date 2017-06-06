import { BaseBotService } from "./BaseBotService";
import * as Repositories from "../repositories/";
import { Types, kernel } from "../infrastructure/dependency-injection/";
import { ValidationException } from "../infrastructure/exceptions/";
import * as Entities from "../entities/";
import * as config from "config";
import { injectable } from "inversify";
import { Bot, Elements } from "facebook-messenger-bot";
import * as Services from "./";
// tslint:disable-next-line:no-var-requires
let momentTz = require("moment-timezone");

@injectable()
export class FbMessengerService extends BaseBotService {
    private fbMessengerBots = [];

    protected async createNewBotInstance(data: any, organization: Entities.IOrganization): Promise<Entities.IBot> {
        return await this.getBotRepository().create({
            service: data.service,
            name: !!data.name ? data.name : organization.name,
            avatar: !!data.avatar ? data.avatar : this.getAvatar(),
            token: data.token,
            organizationId: organization.oId,
            subscribers: [],
            shareableLink: !!data.shareableLink ? data.shareableLink : "",
            verificationToken: data.name.toUpperCase() + "_" + data.service.toUpperCase(),
            webhook: config.get("baseUrl") + "/fbmessenger/" + data.name,
        });
    }

    protected getServiceName(): RegExp {
        return /^fbmessenger$/i;
    }

    public getAvatar(): string {
        return String(config.get("fBMessengerService.avatarImage"));
    }

    public getBotObject(botName: string): any {
        return this.fbMessengerBots[botName];
    }

    protected getBotObjects(): any[] {
        return this.fbMessengerBots;
    }

    protected publishEventToSubscribers(event: Entities.IEvent, bot: Entities.IBot, botObject: any): void {
        for (let j = 0; j < bot.subscribers.length; j++) {
            const out = new Elements();
            if (event.type == "image") {
                out.add({ image: event.content });
            } else {
                out.add({ text: event.content });
            }
            botObject.send(bot.subscribers[j].id, out);
        }
    }

    protected initializeBot(domainBot: Entities.IBot): void {
        const bot = new Bot(domainBot.token, domainBot.verificationToken);

        console.log("Facebook Messenger bot created !");

        this.fbMessengerBots[domainBot.name] = bot;

        console.log("Facebook Messenger bot registered");

        // on message
        bot.on("message", async (message) => {
            console.log(message);
            const { sender } = message;

            await sender.fetch("first_name");

            if (!message.text) {
                return false;
            }

            if (message.text.match(/^hi|hello$/i)) {
                let res = await this.addSubscriber(domainBot, sender.id, sender.first_name);
                const out = new Elements();
                if (res) {
                    out.add({ text: `Hi there ${sender.first_name}. I am ${domainBot.name}` });
                    await bot.send(sender.id, out);
                } else {
                    out.add({ text: `Hi ${sender.first_name}. I think we've already met !` });
                    await bot.send(sender.id, out);
                }
                return true;
            }

            // duplicated will be removed Serbian
            if (message.text.match(/^cao|zdravo$/i)) {
                let res = await this.addSubscriber(domainBot, sender.id, sender.first_name);
                const out = new Elements();
                if (res) {
                    out.add({ text: `Zdravo ja sam ${domainBot.name} bot. Slanjem ovem poruke ste se pretplatili da uživo dobijate najsvežije informacije iz našeg kluba. \n ` +
                    `Da biste dobili trenutno stanje na tabeli pošaljite 'tabela'. \n` +
                    `Da biste dobili rezultate poslednjeg kola pošaljite 'rez'. \n` +
                    `Da biste saznali kada igramo sledeću utakmicu pošaljite 'kad igramo?'. \n` +
                    `Ako želite da prestanete da dobijate poruke uživo sa naših utakmica pošaljite 'stop'.` });
                    await bot.send(sender.id, out);
                } else {
                    out.add({ text: `Zdravo ja sam ${domainBot.name}. Mislim da smo se vec upoznali !` });
                    await bot.send(sender.id, out);
                }
                return true;
            }

            if (message.text.match(/^bye|Bye$/i)) {
                await this.removeSubscriber(domainBot, sender.id, sender.first_name);
                const out = new Elements();
                out.add({ text: `Farewell ${sender.first_name}. I ll be waiting for you to come back !` });
                await bot.send(sender.id, out);
            }

            // duplicated will be removed Serbian
            if (message.text.match(/^zbogom|odoh|ajd|stop$/i)) {
                await this.removeSubscriber(domainBot, sender.id, sender.first_name);
                const out = new Elements();
                out.add({ text: `Zbogom ${sender.first_name}. Vidimo se neki drugi put !` });
                await bot.send(sender.id, out);
            }

            if (message.text.match(/^schedule|raspored|Kada igramo|Kad igramo|Kada igramo?|Kad igramo?$/i)) {
                let scheduleRepo = this.getScheduleRepository();
                let currentTimestamp = (new Date()).toISOString();
                let schedules: Entities.ISchedule[] = (await scheduleRepo.find({ $query: { timestamp: { $gt: currentTimestamp }, organizationId: domainBot.organizationId }, $orderby: { timestamp: 1 } })).slice(0, 3);
                let scheduleMessage: string = "";

                for (let i = 0; i < schedules.length; i++) {
                    let atTimeMessage = this.generateAtWhatTimeMessage(schedules[i].timestamp);
                    scheduleMessage = scheduleMessage + atTimeMessage + "\n" + schedules[i].description + "\n";

                }

                const out = new Elements();
                out.add({ text: scheduleMessage });
                await bot.send(sender.id, out);
            }

            if (message.text.match(/^Results|Rezultati|Rez|Rezultat$/i)) {
                let organization = (await this.getOrganizationRepository().find({ oId: domainBot.organizationId })).shift();
                let webPagelink = organization.data.resultsUrl;
                let imageLink = await this.getWebPageToImgService().getPageImgByUrl(webPagelink);

                const out = new Elements();
                out.add({ image: imageLink });
                await bot.send(sender.id, out);
            }

            if (message.text.match(/^Tabela|Table$/i)) {
                let organization = (await this.getOrganizationRepository().find({ oId: domainBot.organizationId })).shift();
                let webPagelink = organization.data.tableUrl;
                let imageLink = await this.getWebPageToImgService().getPageImgByUrl(webPagelink);

                const out = new Elements();
                out.add({ image: imageLink });
                await bot.send(sender.id, out);
            }

            /** DUMMY KEYWORDS */
            if (message.text.match(/^pozicija na tabeli$/i)) {
                const out = new Elements();
                out.add({ text: `FK Jedinstvo UB je trenutno na drugoj poziciji` });
                await bot.send(sender.id, out);
            }

            if (message.text.match(/^poslednja utakmica$/i)) {
                const out = new Elements();
                out.add({ text: `Poslednja utakmica: FK Jedinstvo UB - Radjevac 3:0` });
                await bot.send(sender.id, out);
            }

            if (message.text.match(/^najbolji strelac$/i)) {
                const out = new Elements();
                out.add({ text: `Najbolji strelac FK Jedinstva sa Ub-a je Alempijevic Jovica` });
                await bot.send(sender.id, out);
            }
        });
    }
}
