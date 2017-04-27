import * as request from "request-promise";
import * as config from "config";

export class HtmlPageToImageProvider {

    public async getImageFromHTML(htmlText: string): Promise<string> {
        console.log(htmlText);
        let accessKey: string = config.get("html2img.accessToken").toString();
        let url: string = config.get("html2img.url").toString();
        let payload = {
            headers: {"content-type" : "application/json"},
            body: JSON.stringify({
                p2i_html: htmlText,
                p2i_key: accessKey,
            }),
        };
        var options = {
            method: 'POST',
            uri: url,
            body: {
                p2i_html: htmlText,
                p2i_key: accessKey,
            },
            json: true // Automatically stringifies the body to JSON
        };
        return await request(options, (err, httpResponse, body) => {
            return body.image_url;
        });
    }

    public async getImageFromURL(pageUrl: string): Promise<any> {
        console.log(pageUrl);
        let accessKey: string = config.get("html2img.accessToken").toString();
        let url: string = config.get("html2img.url").toString();
        url += url + "?p2i_url=" + pageUrl + "&p2i_key=" + accessKey + "&p2i_device=4";
        return await request.get(url);
    }
}
