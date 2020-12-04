import { OnStartUpExecutor } from '../executions';

interface Injectable<I = any, C extends (new (...args: any[]) => I) = new (...args: any[]) => I> {
  instance: I;
  InjectableClass: C;
}

export class Injector {
  private static Injectables: Injectable[] = [];

  public static addToInjectionList(injectable: Injectable): void {
    Injector.Injectables.push(injectable);
  }

  public static getInjection<I, C extends (new (...args: any[]) => I)>(classType: C): I {
    const injection = Injector.Injectables.find((v) => v.InjectableClass === classType);
    return injection ? injection.instance : null;
  }

  /**
   * create and return an instance of any class with taking into consideration all dependency injections
   * uses reflect-metadata in order to get the constructor parameters as a list of classes
   * with typescript u can get that as just a type,
   */
  public static createInstantWithInjections<I, T extends new(...args: any[]) => I>(constructor: T): I {
    const types: any[] = Reflect.getMetadata('design:paramtypes', constructor) || [];
    const dependencies = types.map((type) => {
      const injection = Injector.getInjection(type);
      if (injection) {
        return injection;
      } else {
        throw new Error(`Null injection error for class ${constructor.name}, no service provided for class ${type.name}`)
      }
    });

    const instance = new constructor(...dependencies);
    OnStartUpExecutor.bindInstance(instance);

    return instance;
  }

}
