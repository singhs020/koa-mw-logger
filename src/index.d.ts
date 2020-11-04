interface IConfig {
  name?: string;
  recordIp?: boolean;
  recordHeaders?: boolean;
}

export default function getLogger(config?: IConfig) : any;
