import { Request, Response, NextFunction } from 'express';

// Middleware to log all requests
export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const logMessage = `${new Date().toISOString()} [${req.method}] ${req.originalUrl} - IP: ${req.ip}`;
  console.log(logMessage);
  next();
};