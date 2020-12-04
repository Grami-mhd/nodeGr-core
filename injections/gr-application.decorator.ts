import { MainServer } from "../GRServer.decorator";

export function GRApplication(target: any, key: string) {
  Object.defineProperty(target, key, {
    get: () => MainServer.app,
    set: (val: any) => {
    },
    enumerable: false,
    configurable: false
  });
}
