import { NextFunction, Request, Response } from "express";

export interface Interceptor {
  handle(req: Request, res: Response, next: NextFunction): void;
}
