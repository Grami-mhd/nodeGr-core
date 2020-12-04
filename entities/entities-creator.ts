import { Schema, SchemaDefinition, SchemaOptions } from "mongoose";
import { AttributeDefinition, EntityAttribute, LifeCycle, PostHookCallBack, PreHookCallBack } from "./models";

export class EntitiesCreator {
  private static entities: Map<string, Set<EntityAttribute>> = new Map();
  private static preHooks: Map<string, Set<PreHookCallBack>> = new Map();
  private static ppostHooks: Map<string, Set<{callback: PostHookCallBack, targetLifeCycle: LifeCycle}>> = new Map();

  public static defineProperty(entityName: string, targetName: string, definition: AttributeDefinition) {
    if (!EntitiesCreator.entities.has(entityName)) {
      EntitiesCreator.entities.set(entityName, new Set<EntityAttribute>());
    }

    EntitiesCreator.entities.get(entityName).add({
      name: targetName,
      definition
    });
  }

  public static definePreHook(entityName: string, targetName: LifeCycle, callback: PreHookCallBack): void {
    if (!EntitiesCreator.preHooks.has(entityName)) {
      EntitiesCreator.preHooks.set(entityName, new Set<PreHookCallBack>());
    }

    EntitiesCreator.preHooks.get(entityName).add({
      ...callback,
      targetLifeCycle: targetName
    });
  }

  public static definePostHook(entityName: string, targetLifeCycle: LifeCycle, callback: PostHookCallBack): void {
    if (!EntitiesCreator.ppostHooks.has(entityName)) {
      EntitiesCreator.ppostHooks.set(entityName, new Set());
    }
    EntitiesCreator.ppostHooks.get(entityName).add({
      callback,
      targetLifeCycle
    })
  }

  public static getSchemaForEntity(entityName: string, options?: SchemaOptions): Schema {
    if (!EntitiesCreator.entities.has(entityName)) {
      return null;
    }

    const definition: SchemaDefinition = Array.from(EntitiesCreator.entities.get(entityName)).reduce((acc: SchemaDefinition, attr: EntityAttribute): SchemaDefinition => {
      acc[attr.name] = attr.definition;
      return acc;
    }, {});

    const schema = new Schema<any>(definition, options);

    if (EntitiesCreator.preHooks.has(entityName)) {
      EntitiesCreator.preHooks.get(entityName).forEach(callbackDef => {
        schema.pre(callbackDef.targetLifeCycle, callbackDef.parallel, callbackDef.callBack);
      });
    }

    if (EntitiesCreator.ppostHooks.has(entityName)) {
      EntitiesCreator.ppostHooks.get(entityName).forEach(callbackDef => {
        schema.post(callbackDef.targetLifeCycle, callbackDef.callback);
      });
    }

    return schema;
  }
}
