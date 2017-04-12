import * as express from "express";
import "./controllers/";
import * as config from "config";
import { queryParserMiddleware } from "./middleware/queryParserMiddleware";
import { corsMiddleware } from "./middleware/corsMiddleware";
import { logMiddleware } from "./middleware/logMiddleware";
import { createExpressServer, useExpressServer } from "routing-controllers";
import {text, ParsedAsText} from "body-parser";
import  bodyParser = require("body-parser");

export class Server {
    private app: express.Application;

    constructor() {
        this.app = express();
        this.app.use(corsMiddleware);
        this.app.use(queryParserMiddleware);
        this.app.use(express.static("assets"));
        this.app.use(bodyParser.json());
       // this.app.use(logMiddleware);
        useExpressServer(this.app);
    }

    public listen(port: number) {
        let expressApp: express.Application = this.app;
        expressApp.listen(port);
        console.log("Application listening at port: " + port);
    }
}
