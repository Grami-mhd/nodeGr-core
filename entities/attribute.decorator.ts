import { EntitiesCreator } from "./entities-creator";
import { AttributeDefinition } from "./models";

export function Attribute(params: AttributeDefinition = {}) {
  return function (target: any, key: string) {
    EntitiesCreator.defineProperty(target.constructor.name, key, params);
  }
}
