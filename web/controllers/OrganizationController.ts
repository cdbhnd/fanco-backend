import { CreateBot } from "../../actions/";
import { GetOrganizationBots } from "../../actions/";
import { GetOrganizationBot } from "../../actions/";
import { ExceptionTypes } from "../../infrastructure/exceptions/";
import { JsonController, Param, Body, Get, Post, Put, Delete, Req, Res, HttpCode, UseBefore } from "routing-controllers";
import { ActionBase } from "../../actions/";
import { ActionContext } from "../../actions";
import { AuthMiddleware } from "../middleware/authMiddleware";
import * as jwt from "jwt-simple";
import * as config from "config";
import { HttpError } from "../decorators/httpError";

@JsonController()
export class OrganizationController {

    @Post("/organization/:orgName/bot")
    @HttpCode(200)
    @UseBefore(AuthMiddleware)
    @HttpError(401, ExceptionTypes.InvalidCredentialsException)
    @HttpError(403, ExceptionTypes.UserNotAuthorizedException)
    public async createBot( @Param("orgName") orgName: string, @Param("userId") userId: string, @Body() userSubmitedParams: any) {
        let createBotAction = new CreateBot.Action();
        let actionContext = new ActionContext();
        actionContext.params = userSubmitedParams;
        // tslint:disable-next-line:no-string-literal
        actionContext.params["organization"] = orgName;
        // tslint:disable-next-line:no-string-literal
        actionContext.params["userId"] = userId;
        let createdBot = await createBotAction.run(actionContext);
        return createdBot;
    }

    @Get("/organization/:orgName/bots")
    @UseBefore(AuthMiddleware)
    @HttpCode(200)
    @HttpError(400, ExceptionTypes.ValidationException)
    @HttpError(403, ExceptionTypes.UserNotAuthorizedException)
    public async getOrganizationBots( @Param("userId") userId: string, @Param("orgName") orgName: string) {
        let getOrganizationBots = new GetOrganizationBots.Action();
        let actionContext = new ActionContext();
        actionContext.params = { id: userId };
        // tslint:disable-next-line:no-string-literal
        actionContext.params["organization"] = orgName;
        let bots = await getOrganizationBots.run(actionContext);
        return bots;
    }

    @Get("/organization/:orgName/bot/:botId")
    @UseBefore(AuthMiddleware)
    @HttpCode(200)
    @HttpError(400, ExceptionTypes.ValidationException)
    @HttpError(403, ExceptionTypes.UserNotAuthorizedException)
    public async getBoxes(@Param("userId") userId: string, @Param("botId") botId: string, @Param("orgName") orgName: string) {
        let getOrganizationBot = new GetOrganizationBot.Action();
        let actionContext = new ActionContext();
        actionContext.params = { id: userId };
        // tslint:disable-next-line:no-string-literal
        actionContext.params["organization"] = orgName;
        // tslint:disable-next-line:no-string-literal
        actionContext.params["botId"] = botId;
        let bot = await getOrganizationBot.run(actionContext);
        return bot;
    }

}
