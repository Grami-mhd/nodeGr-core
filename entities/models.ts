import { Document, HookAsyncCallback, Model, NativeError, Schema, SchemaOptions, SchemaType, SchemaTypeOpts } from "mongoose";
import { type } from "os";

export type DocumentLifeCycle = 'init' | 'validate' | 'save' | 'remove';
export type QueryLifeCycle =
  'count'
  | 'find'
  | 'findOne'
  | 'findOneAndRemove'
  | 'findOneAndUpdate'
  | 'update'
  | 'updateOne'
  | 'updateMany';
export type AggregateLifeCycle = 'aggregate';
export type ModelLifeCycle = 'insertMany';

export type LifeCycle = DocumentLifeCycle | QueryLifeCycle | AggregateLifeCycle | ModelLifeCycle;

export type AttributeDefinition = SchemaTypeOpts<any> | Schema | SchemaType;

export interface ModelDefinition<T> {
  name: string;
  schema: Schema;
  model?: Repository<T>;
}

export interface EntityAttribute {
  name: string;
  definition: AttributeDefinition;
}

export interface PreHookCallBack {
  callBack: HookAsyncCallback<any>;
  parallel: boolean;
  targetLifeCycle?: LifeCycle;
}

export type PostHookCallBack = (doc: Document | Document[], next: (err?: NativeError) => void | Promise<any>) => void

export interface GREntityParams extends SchemaOptions {
  name?: string;
}

export declare interface Serializable<T> {
  grSerialize(): T;
}

export type Repository<T> = Model<T & Document>;
