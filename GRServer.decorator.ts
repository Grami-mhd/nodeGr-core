import { Application, NextFunction, Request, Response } from 'express';
import * as mongoose from 'mongoose';
import * as express from 'express';
import { APICallback, APISCallbacks, Controller } from './controllers';
import { Document, model } from 'mongoose';
import { GRLogger } from './logger';
import { ModelDefinition, Repository } from './entities';
import { handleModuleCreation, ModuleFullParams } from './modules';
import { OnStartUpExecutor } from './executions';

export class MainServer {
  public static modules: Array<any> = [];
  public static services: Array<any> = [];
  public static interceptors: Array<any> = [];
  public static controllers: Array<Controller> = [];
  public static models: ModelDefinition<Document>[] = [];
  public static app: Application;
  public static canConnectToMongo: boolean;

  public static getModelByName(name: string): Repository<Document> {
    const definition = MainServer.models.find((model) => model.name === name);
    if (definition && MainServer.canConnectToMongo) {
      if (!Boolean(definition.model)) {
        definition.model = model(definition?.name, definition.schema);
      }

      return definition.model;
    }

    return null;
  }
}

export abstract class GrApplicationServer {
  public app: express.Application;
  public onConfigured: (connected: () => Promise<void>) => void;
  protected databasesConfig: (connected: () => Promise<void>) => void;
}

export function GRServer(serverParams: { modules: Array<any>, mongoUrl?: string, handleAppCreated?: (app: Application) => void }) {
  return function <T extends new(...args: any[]) => GrApplicationServer>(constructor: T): typeof GrApplicationServer & T {
    return class extends constructor {
      public app: express.Application = express();
      public onConfigured = (connected: () => Promise<void>) => {
        this.databasesConfig
          ? this.databasesConfig(connected)
          : connected().then(() => OnStartUpExecutor.exec());
      };
      protected databasesConfig = serverParams.mongoUrl
        ? (connected: () => Promise<void>): void => {
          mongoose.disconnect((err?: any) => {
            // tslint:disable-next-line:max-line-length
            mongoose.connect(
              serverParams.mongoUrl,
              {
                useNewUrlParser: true
              }
            );
            mongoose.connection.on('error', () => {
              GRLogger.logError('Could not connect to the database. Exiting now...');
              MainServer.canConnectToMongo = false;
              process.exit();
            });
            mongoose.connection.once('open', () => {
              MainServer.canConnectToMongo = true;
              connected().then(() => OnStartUpExecutor.exec());
            });
          })
        }
        : null;

      constructor(...args: any[]) {
        super(...args);
        this.app.use(
          (err: any, req: Request, res: Response, next: NextFunction) => {
            err.status = 404;
            next(err);
          });
        if (serverParams.handleAppCreated) {
          serverParams.handleAppCreated(this.app);
        }

        // create all modules
        handleModuleCreation(new ModuleFullParams({ modules: serverParams.modules }));

        // configure interceptors
        MainServer.interceptors.forEach(
          (interceptor: any) => {
            if (interceptor.path) {
              if (interceptor.path()) {
                this.app.use(interceptor.path(), interceptor.handle.bind(interceptor));
              } else {
                this.app.use(interceptor.handle.bind(interceptor));
              }
            }
          }
        );
        // configure controllers
        MainServer.controllers.forEach((controller: Controller) => {
          const filtered = APISCallbacks.callbacks.filter(
            (API): boolean => controller.constructor.name === API.className.constructor.name
          );
          filtered.forEach((API: APICallback) => {
            controller.router[ API.method ](API.path, (<Function>(<any>controller)[ API.callbackName ]).bind(controller));
          });
          this.app.use(controller.path, controller.router)
        });

        MainServer.app = this.app;

        OnStartUpExecutor.bindInstance(this);
      }
    }
  }
}
