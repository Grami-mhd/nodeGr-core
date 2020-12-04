import {PathParams} from "express-serve-static-core";
import {Router} from "express";
import { GRLogger } from "../logger";

export class Controller {
  public get router(): Router {
    GRLogger.logError('please annotate the class as a GrController in order to be able to use this');
    return null;
  }
  public get path(): PathParams {
    GRLogger.logError('please annotate the class as a GrController in order to be able to use this');
    return null;
  }
}
