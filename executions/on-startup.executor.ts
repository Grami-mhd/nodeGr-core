interface CallBack<T extends new(...args: any[]) => any> {
  callbackName: string,
  targetClass: T,
  instance?: any
}

export class OnStartUpExecutor {
  private static callbacks: CallBack<any>[] = [];

  public static addCallBack<T extends new(...args: any[]) => any>(callback: CallBack<T>): void {
    OnStartUpExecutor.callbacks.push(callback);
  }

  public static bindInstance(instance: any): void {
    OnStartUpExecutor.callbacks = OnStartUpExecutor.callbacks.map((callback) => {
      return instance instanceof callback.targetClass.constructor ? { ...callback, instance } : callback;
    });
  }

  public static exec() {
    OnStartUpExecutor.callbacks.forEach((callback) => {
      const functionDef: Function = callback.targetClass[callback.callbackName];
      callback.instance ? functionDef.call(callback.instance) : functionDef();
    })
  }
}
