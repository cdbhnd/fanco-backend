import "reflect-metadata";
import { Server } from "./web/Server";
import "./web/middleware/globalMiddleware";
import {DB} from "./database/DB";

let port: number = process.env.PORT || 8080;

DB.init()
    .then(() => {
        let server: Server = new Server();
        server.listen(port);
    });
