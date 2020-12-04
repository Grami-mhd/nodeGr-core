import { OnStartUpExecutor } from "./on-startup.executor";

export function OnStartup(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  descriptor.configurable = false;
  descriptor.enumerable = false;
  descriptor.writable = false;
  OnStartUpExecutor.addCallBack({ callbackName: propertyKey, targetClass: target });
}
