import * as actions from "../../actions/";
import { ExceptionTypes } from "../../infrastructure/exceptions/";
import { JsonController, Param, Body, Get, Post, Put, Delete, Req, Res, HttpCode, UseBefore } from "routing-controllers";
import { ActionBase } from "../../actions/";
import { ActionContext } from "../../actions";
import { AuthMiddleware } from "../middleware/authMiddleware";
import * as jwt from "jwt-simple";
import * as config from "config";
import { HttpError } from "../decorators/httpError";

@JsonController()
export class EventController {

    @Get("/organization/:orgId/schedules")
    @HttpCode(200)
    @UseBefore(AuthMiddleware)
    @HttpError(401, ExceptionTypes.InvalidCredentialsException)
    @HttpError(403, ExceptionTypes.UserNotAuthorizedException)
    public async getSchedules( @Param("orgId") orgId: string, @Param("userId") userId: string) {
        let getOrgEventsAction = new actions.GetSchedules.Action();
        let actionContext = new ActionContext();
        actionContext.params = {
            userId: userId,
            organization: orgId,
        };
        return await getOrgEventsAction.run(actionContext);
    }

    @Get("/organization/:orgId/schedules/:scheduleId")
    @HttpCode(200)
    @UseBefore(AuthMiddleware)
    @HttpError(401, ExceptionTypes.InvalidCredentialsException)
    @HttpError(403, ExceptionTypes.UserNotAuthorizedException)
    public async getSchedule( @Param("orgId") orgId: string, @Param("userId") userId: string, @Param("scheduleId") scheduleId: string) {
        let getOrgEventsAction = new actions.GetOneSchedule.Action();
        let actionContext = new ActionContext();
        actionContext.params = {
            userId: userId,
            scheduleId: scheduleId,
            organization: orgId,
        };
        return await getOrgEventsAction.run(actionContext);
    }

    @Post("/organization/:orgId/schedules")
    @UseBefore(AuthMiddleware)
    @HttpCode(200)
    @HttpError(400, ExceptionTypes.ValidationException)
    @HttpError(403, ExceptionTypes.UserNotAuthorizedException)
    public async createSchedule( @Param("userId") userId: string, @Param("orgId") orgId: string, @Body() userSubmitedParams: any) {
        let createEventAction = new actions.CreateSchedule.Action();
        let actionContext = new ActionContext();
        actionContext.params = userSubmitedParams;
        actionContext.params.userId = userId;
        actionContext.params.organization = orgId;
        return await createEventAction.run(actionContext);
    }

    @Delete("/organization/:orgId/schedules/:scheduleId")
    @HttpCode(204)
    @UseBefore(AuthMiddleware)
    @HttpError(401, ExceptionTypes.InvalidCredentialsException)
    @HttpError(403, ExceptionTypes.UserNotAuthorizedException)
    public async deleteSchedule( @Param("orgId") orgId: string, @Param("userId") userId: string, @Param("scheduleId") scheduleId: string) {
        let getOrgEventsAction = new actions.DeleteSchedule.Action();
        let actionContext = new ActionContext();
        actionContext.params = {
            userId: userId,
            scheduleId: scheduleId,
            organization: orgId,
        };
        return await getOrgEventsAction.run(actionContext);
    }
}
