import * as actions from "../../actions/";
import { ExceptionTypes } from "../../infrastructure/exceptions/";
import { JsonController, Param, Body, Get, Post, Put, Delete, Req, Res, HttpCode, UseBefore, UploadedFile } from "routing-controllers";
import { ActionBase } from "../../actions/";
import { ActionContext } from "../../actions";
import { AuthMiddleware } from "../middleware/authMiddleware";
import * as config from "config";
import { HttpError } from "../decorators/httpError";

@JsonController()
export class EventController {

    @Get("/organization/:orgId/polls")
    @HttpCode(200)
    @UseBefore(AuthMiddleware)
    @HttpError(403, ExceptionTypes.UserNotAuthorizedException)
    @HttpError(400, ExceptionTypes.ValidationException)
    public async getPolls( @Param("orgId") orgId: string, @Param("userId") userId: string) {
        return null;
    }

    @Post("/organization/:orgId/polls")
    @UseBefore(AuthMiddleware)
    @HttpCode(200)
    @HttpError(403, ExceptionTypes.UserNotAuthorizedException)
    @HttpError(400, ExceptionTypes.ValidationException)
    public async createPoll( @Param("userId") userId: string, @Param("orgId") orgId: string, @Body() userSubmitedParams: any) {
        return null;
    }

    @Put("/organization/:orgId/polls/:pollId")
    @UseBefore(AuthMiddleware)
    @HttpCode(200)
    @HttpError(403, ExceptionTypes.UserNotAuthorizedException)
    @HttpError(400, ExceptionTypes.ValidationException)
    public async updatePoll( @Param("userId") userId: string, @Param("orgId") orgId: string, @Param("pollId") pollId: string, @Body() userSubmitedParams: any) {
        return null;
    }

    @Delete("/organization/:orgId/polls/:pollId")
    @UseBefore(AuthMiddleware)
    @HttpCode(200)
    @HttpError(403, ExceptionTypes.UserNotAuthorizedException)
    @HttpError(400, ExceptionTypes.ValidationException)
    public async deletePoll( @Param("userId") userId: string, @Param("orgId") orgId: string, @Param("pollId") pollId: string) {
        return null;
    }
}
