
export function GrService<S extends (new (...args: any[]) => any)>(constructor: S): S {
  return class extends constructor {
    constructor(...args: any[]) {
      super(...args);
    }
  }
}
