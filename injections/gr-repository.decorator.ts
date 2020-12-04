import { MainServer } from '../GRServer.decorator';

export function GrRepository(name: string) {
  return function (target: any, key: string) {
    Object.defineProperty(target, key, {
      get: () => MainServer.getModelByName(name),
      set: (val: any) => {
      },
      enumerable: false,
      configurable: false
    });
  }
}
