import * as actions from "../../actions/";
import { ExceptionTypes } from "../../infrastructure/exceptions/";
import { JsonController, Param, Body, Get, Post, Put, Delete, Req, Res, HttpCode, UseBefore, UploadedFile } from "routing-controllers";
import { ActionBase } from "../../actions/";
import { ActionContext } from "../../actions";
import { AuthMiddleware } from "../middleware/authMiddleware";
import * as jwt from "jwt-simple";
import * as config from "config";
import { HttpError } from "../decorators/httpError";
import * as multer from "multer";

export const FILE_UPLOAD_OPTIONS = {
    storage: multer.diskStorage({
        destination: (req: any, file: any, cb: any) => {
            cb(null, global["appRoot"] + '/assets');
        },
        filename: (req: any, file: any, cb: any) => {
            cb(null, file.fieldname + '-' + Date.now() + '.jpg');
        }
    })
}

@JsonController()
export class EventController {

    @Get("/organization/:orgId/events")
    @HttpCode(200)
    @UseBefore(AuthMiddleware)
    @HttpError(401, ExceptionTypes.InvalidCredentialsException)
    @HttpError(403, ExceptionTypes.UserNotAuthorizedException)
    public async getEvents( @Param("orgId") orgId: string, @Param("userId") userId: string) {
        let getOrgEventsAction = new actions.GetEvents.Action();
        let actionContext = new ActionContext();
        actionContext.params = {
            userId: userId,
            organization: orgId,
        };
        return await getOrgEventsAction.run(actionContext);
    }

    @Post("/organization/:orgId/events")
    @UseBefore(AuthMiddleware)
    @HttpCode(200)
    @HttpError(400, ExceptionTypes.ValidationException)
    @HttpError(403, ExceptionTypes.UserNotAuthorizedException)
    public async createEvent( @Param("userId") userId: string, @Param("orgId") orgId: string, @Body() userSubmitedParams: any) {
        let createEventAction = new actions.CreateEvent.Action();
        let actionContext = new ActionContext();
        actionContext.params = userSubmitedParams;
        actionContext.params.userId = userId;
        actionContext.params.organization = orgId;
        return await createEventAction.run(actionContext);
    }

    @Post("/organization/:orgId/images")
    @UseBefore(AuthMiddleware)
    @HttpCode(200)
    @HttpError(400, ExceptionTypes.ValidationException)
    @HttpError(403, ExceptionTypes.UserNotAuthorizedException)
    public async createImageEvent(@UploadedFile("fileName", { uploadOptions: FILE_UPLOAD_OPTIONS }) file: any, @Param("userId") userId: string, @Param("orgId") orgId: string) {
        console.log(file);
        let createEventAction = new actions.CreateEvent.Action();
        let actionContext = new ActionContext();
        actionContext.params = {
            type: 'image',
            userId: userId,
            organization: orgId,
            content: file.path
        };
        return await createEventAction.run(actionContext);
    }
}
