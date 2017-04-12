import { Types, kernel } from "../../infrastructure/dependency-injection/";
import {ILogger, IHttpLogEntry} from "../../infrastructure/logger/ILogger";

let logger: ILogger = kernel.get<ILogger>(Types.Logger);

export async function logMiddleware(req: any, res: any, next: Function) {
    let oldWrite = res.write;
    let oldEnd = res.end;

    let log: IHttpLogEntry = {
        createdAt: new Date(),
        request: {
            headers: req.headers,
            method: req.method,
            url: req.url,
            params: req.params,
            query: req.query,
            body: req.body,
        },
        response: {
            headers: null,
            statusCode: null,
            body: null,
        },
    };

    let chunks = [];

    res.write = (chunk) => {
        chunks.push(chunk);
        oldWrite.call(res, chunk);
    };

    res.end = (chunk) => {
        try {
            if (chunk) {
                chunks.push(chunk);
            }

            // if exception is trown, chunk is string
            if (typeof chunk == "string") {
                log.response.body = chunk;
            } else {
                log.response.body = Buffer.concat(chunks).toString("utf8");
            }

            log.response.headers = res._headers;
            log.response.statusCode = res.statusCode;

            logger.createHttpLog(log);

        } catch (e) {
            console.log("Error occurred in logging middleware " + e);
        }
        oldEnd.call(res, chunk);
    };

    next();
}
