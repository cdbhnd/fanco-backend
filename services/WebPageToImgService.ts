import { IWebPageToImgService } from "./IWebPageToImgService";
import { HtmlPageToImageProvider } from "../providers/pageToImageProvider";

export class WebPageToImgService implements IWebPageToImgService {
    public async getPageImgByUrl(link: string): Promise<string> {
        let res = await this.getImageAction(link);
        return JSON.stringify(res);
    }

    private async getImageAction(link) {
        let imageProvider: HtmlPageToImageProvider = new HtmlPageToImageProvider();
        let response = await imageProvider.getImageFromURL(link);
        let jsonResponse: any = JSON.parse(response);
        if (jsonResponse.status == "processing") {
            return await this.getImageAction(link);
        }
        return jsonResponse;
    }
}
