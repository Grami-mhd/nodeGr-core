export class GRLogger {
  public static logError(err: any): void {
    console.error(
      '\x1b[31m',
      'GRModule declaration error\n \t',
      err,
      '\x1b[0m'
    )
  }
  public static log(...args: any[]): void {
    console.log(...args);
  }
}
