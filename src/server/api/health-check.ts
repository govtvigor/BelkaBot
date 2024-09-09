import { Request, Response } from 'express';

export const healthCheck = (req: Request, res: Response) => {
  res.send("Server and Bot are running!");
};
