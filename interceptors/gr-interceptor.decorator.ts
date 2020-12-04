import { PathParams } from "express-serve-static-core";
import { Interceptor } from "./interceptor";
import { GRLogger } from "../logger";

export function GRInterceptor(path?: PathParams) {
  return function <T extends new(...args: any[]) => Interceptor>(constructor: T) {
    return class extends constructor {
      path: () => PathParams;

      constructor(...args: any[]) {
        super(...args);
        try {
          if ((<any>this).handle) {
            this.path = () => path;
            // APIInterceptors.interceptors.push({path, instance: <any>this});
          } else {
            throw Error(`"${ constructor.name }" must implement GRInterceptor and have a handle method`)
          }
        } catch (e) {
          GRLogger.logError(e.toString())
        }
      }
    }
  }
}
