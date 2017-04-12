import { MiddlewareGlobalBefore, MiddlewareInterface } from "routing-controllers";

@MiddlewareGlobalBefore()
export class GlobalMiddleware implements MiddlewareInterface {

   public use(request: any, response: any, next?: (err?: any) => any): any {
        // tslint:disable-next-line:no-string-literal
        global["response_reference"] = response;
        next();
    }
}
