import { Request, ResponseToolkit } from "@hapi/hapi";
import MongoSession from "./MongoSession.js";
export type CallbackFunction = (payload: any, credentials: any) => Promise<any>;

export const easyResponse = async (
  req: Request,
  h: ResponseToolkit,
  callback: CallbackFunction,
) => {
  return h.response(
    await MongoSession.noTransaction(async () => {
      const PLD = req.payload as any;
      const CRED = req.auth.credentials as any;
      return await callback(PLD, CRED);
    }),
  );
};
