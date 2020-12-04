import { HookDoneFunction, HookNextFunction } from "mongoose";
import { LifeCycle } from "./models";
import { EntitiesCreator } from "./entities-creator";

export function PreHook(targetCycle: LifeCycle, parallel: boolean = false) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.configurable = false;
    descriptor.enumerable = false;
    descriptor.writable = false;

    EntitiesCreator.definePreHook(
      target.constructor.name,
      targetCycle,
      {
        parallel,
        callBack: async function (next: HookNextFunction, done: HookDoneFunction, docs: any[]) {
          return await descriptor.value.bind(this)(next, done, docs);
        }
      }
    );
  }
}
