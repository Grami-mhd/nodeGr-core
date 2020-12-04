import { PathParams } from 'express-serve-static-core';

type RequestMethod = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'all' | 'head';

export interface APICallback {
  className: any;
  path: PathParams;
  callbackName: string;
  method: RequestMethod;
}

export class APISCallbacks {
  static callbacks: APICallback[] = [];
}

function defineRequest(path: PathParams, method: RequestMethod) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.writable = false;
    descriptor.enumerable = true;
    descriptor.configurable = false;
    APISCallbacks.callbacks.push({
      path: path,
      method: method,
      className: target,
      callbackName: propertyKey
    });
  }
}

export function GET(path: PathParams = '/') {
  return defineRequest(path, 'get');
}

export function POST(path: PathParams = '/') {
  return defineRequest(path, 'post');
}

export function PUT(path: PathParams = '/') {
  return defineRequest(path, 'put');
}

export function PATCH(path: PathParams = '/') {
  return defineRequest(path, 'patch');
}

export function DELETE(path: PathParams = '/') {
  return defineRequest(path, 'delete');
}

export function ALL(path: PathParams = '/') {
  return defineRequest(path, 'all');
}

export function HEAD(path: PathParams = '/') {
  return defineRequest(path, 'head');
}
