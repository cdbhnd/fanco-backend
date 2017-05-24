import "reflect-metadata";
import { Server } from "./web/Server";
import "./web/middleware/globalMiddleware";
import {DB} from "./database/DB";
import * as path from "path";

global["appRoot"] = path.resolve(__dirname);

let port: number = process.env.PORT || 8080;

DB.init()
    .then(() => {
        let server: Server = new Server();
        server.listen(port);
    });
