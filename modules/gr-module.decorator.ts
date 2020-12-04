import { ModuleParams } from './module-params';
import { MainServer } from '../GRServer.decorator';
import { Injector } from '../injections';
import 'reflect-metadata';
import { GRLogger } from '../logger';
import { Controller } from '../controllers';
import { Interceptor } from '../interceptors';


export function GRModule(params: ModuleParams) {
  return function <T extends new(...args: any[]) => {}>(constructor: T) {
    return class extends constructor {
      constructor(...args: any[]) {
        super(...args);
        try {
          handleModuleCreation(new ModuleFullParams(params));
        } catch (e) {
          GRLogger.logError(e.toString())
        }
      }
    }
  }
}

/**
 * overhead class that simply initialises all module parameters with empty arrays
 */
export class ModuleFullParams implements ModuleParams {
  public controllers: Array<{ new(...args: any[]): Controller }>;
  public entities: Array<{ new(...args: any[]): any }>;
  public interceptors: Array<{ new(...args: any[]): Interceptor }>;
  public modules: Array<{ new(...args: any[]): any }>;
  public services: Array<{ new(...args: any[]): any }>;

  public constructor(params: ModuleParams) {
    this.controllers = params.controllers || [];
    this.entities = params.entities || [];
    this.interceptors = params.interceptors || [];
    this.modules = params.modules || [];
    this.services = params.services || [];
  }
}

/**
 * handle a module creation
 * create all inner modules, interceptors, controllers and services.
 * all instances except for modules have dependency injections.
 * only services can be injected
 */
export function handleModuleCreation(params: ModuleFullParams): void {
  // console.log(params);
  // create modules creation.
  // if a module is created once there is no need to create it again and there is no need to throw an error
  params.modules.forEach((module) => {
    const old = MainServer.modules.find((oldModule) => oldModule instanceof module);
    if (!old) {
      MainServer.modules.push(new module())
    }
  });

  // create services.
  // a service needs to be added to the Injectors list since it can be injected
  // add it to the list of created services
  // a service cannot be injected twice
  params.services.forEach((serviceType) => {
    const old = MainServer.services.find((service) => service instanceof serviceType);
    if (old) {
      throw Error(`Service "${ serviceType.name }" has already been declared`)
    } else {
      const instance = Injector.createInstantWithInjections(serviceType);
      Injector.addToInjectionList({
        instance,
        InjectableClass: serviceType
      });
      MainServer.services.push(instance);
    }
  });

  // create a controller.
  // add it to the list of created controllers
  // a controller cannot be injected twice
  params.controllers.forEach((controllerType) => {
    const old = MainServer.controllers.find((oldController) => oldController instanceof controllerType);
    if (old) {
      throw Error(`Controller "${ controllerType.name }" has already been declared`)
    } else {
      MainServer.controllers.push(Injector.createInstantWithInjections(controllerType));
    }
  });

  // create an interceptor.
  // add it to the list of created interceptors
  // an interceptor cannot be injected twice
  params.interceptors.forEach((interceptorType) => {
    const old = MainServer.interceptors.find((oldInterceptor) => oldInterceptor instanceof interceptorType);
    if (old) {
      throw Error(`Interceptor "${ interceptorType.name }" has already been declared`)
    } else {
      MainServer.interceptors.push(Injector.createInstantWithInjections(interceptorType));
    }
  });

}
