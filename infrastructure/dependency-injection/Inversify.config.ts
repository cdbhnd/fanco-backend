import { Kernel } from "inversify";
import Types from "./Types";
import * as Repositories from "../../repositories/index";
import * as Services from "../../services/index";
// import * as Providers from "../../providers/index";
import * as DB from "../../database/index";
import * as actions from "../../actions";
import {Logger} from "../logger/Logger";
import {ILogger} from "../logger/ILogger";

let kernel = new Kernel();

kernel.bind<Repositories.IAdminUserRepository>(Types.IAdminUserRepository).to(DB.AdminUsers);
kernel.bind<Repositories.IBotRepository>(Types.IBotRepository).to(DB.Bots);
kernel.bind<Repositories.IOrganizationRepository>(Types.IOrganizationRepository).to(DB.Organizations);

// utility
kernel.bind<ILogger>(Types.Logger).to(Logger).inSingletonScope();

// variable bindings
kernel.bind<string>("entityName").toConstantValue("admin_users").whenInjectedInto(DB.AdminUsers);
kernel.bind<string>("entityName").toConstantValue("organizations").whenInjectedInto(DB.Organizations);
kernel.bind<string>("entityName").toConstantValue("bots").whenInjectedInto(DB.Bots);

export default kernel;
