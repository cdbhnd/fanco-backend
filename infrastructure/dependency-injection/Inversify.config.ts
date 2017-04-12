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
kernel.bind<string>("entityName").toConstantValue("admin_users").whenInjectedInto(DB.AdminUsers);
// utility
kernel.bind<ILogger>(Types.Logger).to(Logger).inSingletonScope();

export default kernel;
