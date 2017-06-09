import * as express from "express";
import "./controllers/";
import * as config from "config";
import { queryParserMiddleware } from "./middleware/queryParserMiddleware";
import { corsMiddleware } from "./middleware/corsMiddleware";
import { logMiddleware } from "./middleware/logMiddleware";
import { createExpressServer, useExpressServer } from "routing-controllers";
import { text, ParsedAsText } from "body-parser";
import bodyParser = require("body-parser");
import { InitializeAllBots } from "../actions/";
import { ActionContext } from "../actions";
import * as Services from "../services/index";
import { Types, kernel } from "../infrastructure/dependency-injection/";

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
        let initializeAllBots = new InitializeAllBots.Action();
        let actionContext = new ActionContext();
        await initializeAllBots.run(actionContext);

        let viberService = kernel.getNamed<Services.IBotService>(Types.IBotService, "viber");
        let fBMessengerService = kernel.getNamed<Services.IBotService>(Types.IBotService, "fbmessenger");

        this.app.use("/viber/:botName", (req, res, next) => {
            try {
                let botName = req.params.botName;
                let bot = viberService.getBotObject(botName);
                let callback = bot.middleware();
                return callback(req, res, next);
            } catch (e) {
                console.log(e);
                return false;
            }
        });

        this.app.use("/fbmessenger/:botName", (req, res, next) => {
            try {
                let botName = req.params.botName;
                let bot = fBMessengerService.getBotObject(botName);
                let callback = bot.router();
                return callback(req, res, next);
            } catch (e) {
                console.log(e);
                return false;
            }
        });

        this.app.use(corsMiddleware);
        this.app.use(queryParserMiddleware);
        this.app.use(express.static("assets"));
        this.app.use(bodyParser.json());
        // this.app.use(logMiddleware);
        useExpressServer(this.app);
    }
}
