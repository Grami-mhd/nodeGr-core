import { Controller } from '../controllers';
import { Interceptor } from '../interceptors';

export interface ModuleParams {
  modules?: Array<new (...args: any[]) => any>;
  entities?: Array<new (...args: any[]) => any>;
  interceptors?: Array<new (...args: any[]) => Interceptor>;
  controllers?: Array<new (...args: any[]) => Controller>;
  services?: Array<new (...args: any[]) => any>
}
