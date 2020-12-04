import { EntitiesCreator } from './entities-creator';
import { GREntityParams } from './models';
import { MainServer } from '../GRServer.decorator';

export function GREntity(params?: GREntityParams) {
  return function <T extends new(...args: any[]) => {}>(constructor: T): any {
    const name: string = params.name || constructor.name;

    const { name: string, ...schemaOptions } = params;
    const prototypeProperties: string[] = Object.getOwnPropertyNames(constructor.prototype).filter(callback => callback !== 'constructor');
    const schema = EntitiesCreator.getSchemaForEntity(constructor.name, schemaOptions);

    prototypeProperties.forEach((property) => {
      const descriptor = Object.getOwnPropertyDescriptor(constructor.prototype, property);
      if (typeof descriptor.value === 'function') {
        schema.methods[ property ] = descriptor.value;
      } else {
        schema.virtual(property).get(descriptor.get).set(descriptor.set);
      }
    });

    MainServer.models.push({ name, schema });

    return class extends constructor {
      constructor(...args: any[]) {
        super(...args);
      }
    };
  }
}
