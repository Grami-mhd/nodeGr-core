import { Document, NativeError } from "mongoose";
import { LifeCycle } from "./models";
import { EntitiesCreator } from "./entities-creator";

export function PostHook(targetCycle: LifeCycle) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.configurable = false;
    descriptor.enumerable = false;
    descriptor.writable = false;

    EntitiesCreator.definePostHook(
      target.constructor.name,
      targetCycle,
      function (docs: Document | Document[], next: (err?: NativeError) => void | Promise<any>) {
          return Promise.resolve(descriptor.value.bind(Array.isArray(docs) ? null : docs)(this))
          .then(next);
      }
    );
  }
}
