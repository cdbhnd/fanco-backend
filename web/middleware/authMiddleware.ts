import {Middleware, MiddlewareInterface} from "routing-controllers";
import * as config from "config";
import * as jwt from "jwt-simple";

const secret: string = String(config.get("secret"));

@Middleware()
export class AuthMiddleware implements MiddlewareInterface {

    public async use(request: any, response: any, next?: (err?: any) => any): Promise<any> {

        if (!request.headers.authorization) {
            return response.status(401).end();
        }

        let authorizationString = request.headers.authorization.split(" ");

        if (authorizationString[0] == "Bearer" && !!authorizationString[1]) {

            try {
                let decodedToken = jwt.decode(authorizationString[1], secret);
                if (!request.params) {
                    request.params = {};
                }
                request.params.userId = decodedToken.authUserId;
            }catch (err) {
                return response.status(401).end();
            }

        } else {
            return response.status(401).end();
        }

        next();
    }
}
