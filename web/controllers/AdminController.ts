import {AdminLogin} from "../../actions/";
import {ExceptionTypes} from "../../infrastructure/exceptions/";
import {JsonController, Param, Body, Get, Post, Put, Delete, Req, Res, HttpCode, UseBefore} from "routing-controllers";
import {ActionBase} from "../../actions/";
import {ActionContext} from "../../actions";
import {AuthMiddleware} from  "../middleware/authMiddleware";
import * as jwt from "jwt-simple";
import * as config from "config";
import {HttpError} from "../decorators/httpError";

@JsonController()
export class UserController {

    @Post("/admin/login")
    @HttpCode(200)
    @HttpError(401, ExceptionTypes.InvalidCredentialsException)
    public async login( @Body() userSubmitedParams: any) {
        let adminLoginAction = new AdminLogin.Action();
        let actionContext = new ActionContext();
        actionContext.params = userSubmitedParams;
        let adminUser = await adminLoginAction.run(actionContext);
        let secret: string = String(config.get("secret"));
        adminUser.token = jwt.encode({ authUserId: adminUser.id }, secret);
        return adminUser;
    }
}
