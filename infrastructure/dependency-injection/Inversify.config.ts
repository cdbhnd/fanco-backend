import { Kernel } from "inversify";
import Types from "./Types";
import * as Repositories from "../../repositories/index";
import * as Services from "../../services/index";
// import * as Providers from "../../providers/index";
import * as DB from "../../database/index";
import * as actions from "../../actions";
import {Logger} from "../logger/Logger";
import {ILogger} from "../logger/ILogger";
import * as Providers from "../../providers/";

let kernel = new Kernel();

kernel.bind<Repositories.IAdminUserRepository>(Types.IAdminUserRepository).to(DB.AdminUsers);
kernel.bind<Repositories.IBotRepository>(Types.IBotRepository).to(DB.Bots);
kernel.bind<Repositories.IOrganizationRepository>(Types.IOrganizationRepository).to(DB.Organizations);
kernel.bind<Repositories.IEventRepository>(Types.IEventRepository).to(DB.Events);
kernel.bind<Repositories.IScheduleRepository>(Types.IScheduleRepository).to(DB.Schedules);
kernel.bind<Providers.IDropBoxProvider>(Types.IDropBoxProvider).to(Providers.DropBoxProvider);

kernel.bind<Services.IBotService>(Types.IBotService).to(Services.ViberBotService).inSingletonScope().whenTargetNamed("viber");
kernel.bind<Services.IBotService>(Types.IBotService).to(Services.FbMessengerService).inSingletonScope().whenTargetNamed("fbmessenger");
kernel.bind<Services.IWebPageToImgService>(Types.IWebPageToImgService).to(Services.WebPageToImgService);
// utility
kernel.bind<ILogger>(Types.Logger).to(Logger).inSingletonScope();

// variable bindings
kernel.bind<string>("entityName").toConstantValue("admin_users").whenInjectedInto(DB.AdminUsers);
kernel.bind<string>("entityName").toConstantValue("organizations").whenInjectedInto(DB.Organizations);
kernel.bind<string>("entityName").toConstantValue("bots").whenInjectedInto(DB.Bots);
kernel.bind<string>("entityName").toConstantValue("events").whenInjectedInto(DB.Events);
kernel.bind<string>("entityName").toConstantValue("schedules").whenInjectedInto(DB.Schedules);

export default kernel;
