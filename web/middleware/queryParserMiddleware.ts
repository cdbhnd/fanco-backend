import { Parser } from "../../utility/Parser";

export async function queryParserMiddleware(req: any, res: any, next: Function) {
    let radiusSerach;
    if (!!req.query.radiusSearch) {
        radiusSerach = JSON.parse(req.query.radiusSearch);
        delete req.query.radiusSearch;
    }

    let parser = new Parser();
    req.parsedQuery = parser.mongodb(req.query);

    if (!!radiusSerach) {
        req.parsedQuery.radiusSearch = radiusSerach;
    }

    return next();
}
