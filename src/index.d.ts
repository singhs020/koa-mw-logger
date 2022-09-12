import { DefaultState, Middleware } from "koa";
import { Logger as NativeLogger } from "pino";

interface IConfig {
  name?: string;
  recordIp?: boolean;
  recordHeaders?: boolean;
}

export type Logger = NativeLogger;

export default function getLogger(config?: IConfig) : Middleware<DefaultState, { ctx: { logger: Logger } }>;
