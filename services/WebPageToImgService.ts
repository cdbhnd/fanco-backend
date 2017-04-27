import { IWebPageToImgService } from "./IWebPageToImgService";
import { HtmlPageToImageProvider } from "../providers/pageToImageProvider";
import { injectable } from "inversify";

@injectable()
export class WebPageToImgService implements IWebPageToImgService {
    public async getPageImgByUrl(link: string): Promise<string> {
        console.log("UNISHOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO !!!!!!!!!!!!!!");
        console.log(link);
        let res = await this.getImageAction(link);
        return JSON.stringify(res);
    }

    private async getImageAction(link) {
        console.log("GET IMAGE ACCTIONNNN ");
        let imageProvider: HtmlPageToImageProvider = new HtmlPageToImageProvider();
        let response = await imageProvider.getImageFromURL(link);
        let jsonResponse: any = JSON.parse(response);
        if (jsonResponse.status == "processing") {
            return await this.getImageAction(link);
        }
        return jsonResponse;
    }
}
