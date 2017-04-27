import * as request from "request-promise";

export class HtmlPageProvider {

    public async read(pageUrl: string): Promise<string> {
        return await request.get(pageUrl, (err, httpResponse, body) => {
            return body;
        });
    }
}
