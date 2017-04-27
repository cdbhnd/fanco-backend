export interface IWebPageToImgService {
    getPageImgByUrl(link: string): Promise<string>;
}
