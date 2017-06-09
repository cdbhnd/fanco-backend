import { CreateOrganizationBot } from "../../actions/";
import { GetOrganizationBots } from "../../actions/";
import { GetOrganizationBot } from "../../actions/";
import { DeleteOrganizationBot } from "../../actions/";
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

    @Post("/organization/:orgId/bots")
    @HttpCode(200)
    @UseBefore(AuthMiddleware)
    @HttpError(401, ExceptionTypes.InvalidCredentialsException)
    @HttpError(403, ExceptionTypes.UserNotAuthorizedException)
    public async createBot( @Param("orgId") orgId: string, @Param("userId") userId: string, @Body() userSubmitedParams: any) {
        let createBotAction = new CreateOrganizationBot.Action();
        let actionContext = new ActionContext();
        actionContext.params = userSubmitedParams;
        // tslint:disable-next-line:no-string-literal
        actionContext.params["organization"] = orgId;
        // tslint:disable-next-line:no-string-literal
        actionContext.params["userId"] = userId;
        let createdBot = await createBotAction.run(actionContext);
        return createdBot;
    }

    @Get("/organization/:orgId/bots")
    @UseBefore(AuthMiddleware)
    @HttpCode(200)
    @HttpError(400, ExceptionTypes.ValidationException)
    @HttpError(403, ExceptionTypes.UserNotAuthorizedException)
    public async getOrganizationBots( @Param("userId") userId: string, @Param("orgId") orgId: string) {
        let getOrganizationBots = new GetOrganizationBots.Action();
        let actionContext = new ActionContext();
        actionContext.params = { userId: userId };
        // tslint:disable-next-line:no-string-literal
        actionContext.params["organization"] = orgId;
        let bots = await getOrganizationBots.run(actionContext);
        return bots;
    }

    @Get("/organization/:orgId/bots/:botId")
    @UseBefore(AuthMiddleware)
    @HttpCode(200)
    @HttpError(400, ExceptionTypes.ValidationException)
    @HttpError(403, ExceptionTypes.UserNotAuthorizedException)
    public async getOrganizationBot( @Param("userId") userId: string, @Param("botId") botId: string, @Param("orgId") orgId: string) {
        let getOrganizationBot = new GetOrganizationBot.Action();
        let actionContext = new ActionContext();
        actionContext.params = { userId: userId };
        // tslint:disable-next-line:no-string-literal
        actionContext.params["organization"] = orgId;
        // tslint:disable-next-line:no-string-literal
        actionContext.params["botId"] = botId;
        let bot = await getOrganizationBot.run(actionContext);
        return bot;
    }

    @Delete("/organization/:orgName/bots/:botId")
    @UseBefore(AuthMiddleware)
    @HttpCode(200)
    @HttpError(400, ExceptionTypes.ValidationException)
    @HttpError(403, ExceptionTypes.UserNotAuthorizedException)
    public async deleteOrganizationBot( @Param("userId") userId: string, @Param("botId") botId: string, @Param("orgName") orgName: string) {
        let deleteOrganizationBot = new DeleteOrganizationBot.Action();
        let actionContext = new ActionContext();
        actionContext.params = { userId: userId };
        // tslint:disable-next-line:no-string-literal
        actionContext.params["organization"] = orgName;
        // tslint:disable-next-line:no-string-literal
        actionContext.params["botId"] = botId;
        return await deleteOrganizationBot.run(actionContext);
    }
}
