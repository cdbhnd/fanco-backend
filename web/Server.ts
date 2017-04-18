import * as express from "express";
import "./controllers/";
import * as config from "config";
import { queryParserMiddleware } from "./middleware/queryParserMiddleware";
import { corsMiddleware } from "./middleware/corsMiddleware";
import { logMiddleware } from "./middleware/logMiddleware";
import { createExpressServer, useExpressServer } from "routing-controllers";
import { text, ParsedAsText } from "body-parser";
import bodyParser = require("body-parser");
import { InitializeViberBots } from "../actions/";
import { ActionContext } from "../actions";

export class Server {
    private app: express.Application;

    constructor() {
        this.app = express();
    }

    public listen(port: number) {
        let expressApp: express.Application = this.app;

        this.initialize();
        expressApp.listen(port);
        console.log("Application listening at port: " + port);
    }

    private async initialize() {
        let initializeViberBots = new InitializeViberBots.Action();
        let actionContext = new ActionContext();
        actionContext.params = { app: this.app };
        await initializeViberBots.run(actionContext);

        this.app.use(corsMiddleware);
        this.app.use(queryParserMiddleware);
        this.app.use(express.static("assets"));
        this.app.use(bodyParser.json());
        // this.app.use(logMiddleware);
        useExpressServer(this.app);
    }
}
