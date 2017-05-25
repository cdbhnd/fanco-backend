import * as request from "request-promise";
import * as config from "config";

export class HtmlPageToImageProvider {

    public async getImageFromURL(pageUrl: string): Promise<any> {
        let accessKey: string = config.get("html2img.accessToken").toString();
        let url: string = config.get("html2img.url").toString();
        let hours: number = Math.floor((new Date).getTime() / 1000 / 60 / 60);
        url += url + "?p2i_url=" + pageUrl + "&p2i_key=" + accessKey + "&p2i_device=0" + "&p2i_imageformat=jpg" + "&p2i_quality=95&c_hrs=" + hours;
        return await request.get(url);
    }
}
