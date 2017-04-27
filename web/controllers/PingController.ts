import {Controller, Param, Body, Get, Post, Put, Delete, HttpCode} from "routing-controllers";
import * as Repo from "../../repositories/";
import * as Entities from "../../entities/";
import { Types, kernel } from "../../infrastructure/dependency-injection/";
import * as actions from "../../actions/";
import { HtmlPageToImageProvider } from "../../providers/page.to.image.provider";

@Controller()
export class PingController {

    @Get("/ping")
    @HttpCode(200)
    public async printHello() {
        return "Pong!!!";
    }

    @Get("/getImage")
    @HttpCode(200)
    public async getImage() {
        let res = await this.getImageAction();

        return JSON.stringify(res);
    }

    private async getImageAction() {
        let imageProvider: HtmlPageToImageProvider = new HtmlPageToImageProvider();
        let response = await imageProvider.getImageFromURL("http://srbijasport.net/share/iframe/d5c516d9823d481b82fbc1a91f967c02");
        let jsonResponse: any = JSON.parse(response);
        if (jsonResponse.status == "processing") {
            return await this.getImageAction();
        }
        return jsonResponse;
    }
}
