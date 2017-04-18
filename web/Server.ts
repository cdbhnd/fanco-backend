import * as express from "express";
import "./controllers/";
import * as config from "config";
import { queryParserMiddleware } from "./middleware/queryParserMiddleware";
import { corsMiddleware } from "./middleware/corsMiddleware";
import { logMiddleware } from "./middleware/logMiddleware";
import { createExpressServer, useExpressServer } from "routing-controllers";
import {text, ParsedAsText} from "body-parser";
import  bodyParser = require("body-parser");

// tslint:disable-next-line:no-var-requires
const ViberBot  = require("viber-bot").Bot;
// tslint:disable-next-line:no-var-requires
const BotEvents = require("viber-bot").Events;

const bot = new ViberBot({
    authToken: "45d9b1022530263a-61783d6c83e60359-5a7a31304ea87cf9",
    name: "CodeBehindEchoBot",
    avatar: "http://codebehind.rs/Content/Images/main_logo_01.png", // It is recommended to be 720x720, and no more than 100kb.
});

    // tslint:disable-next-line:no-var-requires
    // const http = require("http");
    // let s = process.env.PORT || 8080;

    // http.createServer(bot.middleware()).listen(s, () => bot.setWebhook("http://localhost:8080/viber/webhook"));

// Perfect! Now here's the key part:
bot.on(BotEvents.MESSAGE_RECEIVED, (message, response) => {
    // Echo's back the message to the client. Your bot logic should sit here.
    response.send(message);
});

export class Server {
    private app: express.Application;

    constructor() {
        this.app = express();
        this.app.use(corsMiddleware);
        this.app.use("/test", bot.middleware());
        this.app.use(queryParserMiddleware);
        this.app.use(express.static("assets"));
        this.app.use(bodyParser.json());
       // this.app.use(logMiddleware);

        console.log("OKINO SET WEB HOOK !!!!!");
        bot.setWebhook("https://test-viber-bot.herokuapp.com/test");
        useExpressServer(this.app);
    }

    public listen(port: number) {
        let expressApp: express.Application = this.app;
        expressApp.listen(port);
        console.log("Application listening at port: " + port);
    }
}
