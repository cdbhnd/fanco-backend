import {Controller, Param, Body, Get, Post, Put, Delete, HttpCode} from "routing-controllers";
import * as Repo from "../../repositories/";
import * as Entities from "../../entities/";
import { Types, kernel } from "../../infrastructure/dependency-injection/";
import * as actions from "../../actions/";

@Controller()
export class PingController {

    @Get("/ping")
    @HttpCode(200)
    public async printHello() {
        return "Pong!!!";
    }
}
