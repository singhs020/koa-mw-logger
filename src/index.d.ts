import { DefaultState, Middleware } from "koa";
import { Logger } from "pino";

interface IConfig {
  name?: string;
  recordIp?: boolean;
  recordHeaders?: boolean;
}

export default function getLogger(config?: IConfig) : Middleware<DefaultState, { ctx: { logger: Logger } }>;
