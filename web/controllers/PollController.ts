import { ActionBase, ActionContext, GetPolls, CreatePoll, UpdatePoll, DeletePoll } from "../../actions/";
import { ExceptionTypes } from "../../infrastructure/exceptions/";
import { JsonController, Param, Body, Get, Post, Put, Delete, Req, Res, HttpCode, UseBefore, UploadedFile } from "routing-controllers";
import { AuthMiddleware } from "../middleware/authMiddleware";
import * as config from "config";
import { HttpError } from "../decorators/httpError";
import { IPoll } from "../../entities/";

@JsonController()
export class EventController {

    @Get("/organization/:orgId/polls")
    @HttpCode(200)
    @UseBefore(AuthMiddleware)
    @HttpError(403, ExceptionTypes.UserNotAuthorizedException)
    @HttpError(400, ExceptionTypes.ValidationException)
    public async getPolls( @Param("orgId") orgId: string, @Param("userId") userId: string) {
        let getPollsAction: ActionBase<IPoll[]> = new GetPolls.Action();
        let actionContext: ActionContext = new ActionContext();
        actionContext.params = {
            organization: orgId,
            userId: userId
        };
        return await getPollsAction.run(actionContext);
    }

    @Post("/organization/:orgId/polls")
    @UseBefore(AuthMiddleware)
    @HttpCode(200)
    @HttpError(403, ExceptionTypes.UserNotAuthorizedException)
    @HttpError(400, ExceptionTypes.ValidationException)
    public async createPoll( @Param("userId") userId: string, @Param("orgId") orgId: string, @Body() userSubmitedParams: any) {
        let createPollAction: ActionBase<IPoll> = new CreatePoll.Action();
        let actionContext: ActionContext = new ActionContext();
        actionContext.params = {
            organization: orgId,
            userId: userId,
            data: userSubmitedParams
        };
        return await createPollAction.run(actionContext);
    }

    @Put("/organization/:orgId/polls/:pollId")
    @UseBefore(AuthMiddleware)
    @HttpCode(200)
    @HttpError(403, ExceptionTypes.UserNotAuthorizedException)
    @HttpError(400, ExceptionTypes.ValidationException)
    public async updatePoll( @Param("userId") userId: string, @Param("orgId") orgId: string, @Param("pollId") pollId: string, @Body() userSubmitedParams: any) {
        let updatePollAction: ActionBase<IPoll> = new UpdatePoll.Action();
        let actionContext: ActionContext = new ActionContext();
        actionContext.params = {
            organization: orgId,
            userId: userId,
            pollId: pollId,
            data: userSubmitedParams
        };
        return await updatePollAction.run(actionContext);
    }

    @Delete("/organization/:orgId/polls/:pollId")
    @UseBefore(AuthMiddleware)
    @HttpCode(200)
    @HttpError(403, ExceptionTypes.UserNotAuthorizedException)
    @HttpError(400, ExceptionTypes.ValidationException)
    public async deletePoll( @Param("userId") userId: string, @Param("orgId") orgId: string, @Param("pollId") pollId: string) {
        let deletePollAction: ActionBase<IPoll> = new UpdatePoll.Action();
        let actionContext: ActionContext = new ActionContext();
        actionContext.params = {
            organization: orgId,
            userId: userId,
            pollId: pollId
        };
        return await deletePollAction.run(actionContext);
    }
}
