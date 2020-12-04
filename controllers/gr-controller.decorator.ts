import { PathParams } from 'express-serve-static-core';
import { Router } from 'express';
import { Controller } from './controller';

export function GRController(path: PathParams = '/') {
  return function <T extends (new (...args: any[]) => Controller)>(constructor: T) {
    const router: Router = Router();
    return class extends constructor {
      public constructor(...args: any[]) {
        super(...args);
      }

      public get router(): Router {
        return router
      }

      public get path(): PathParams {
        return path;
      }
    }
  }
}
