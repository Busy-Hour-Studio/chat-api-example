import _ from 'lodash';
import { config as dotenvConfig } from 'dotenv';
import { ENVIRONMENT_NAME, ENVIRONMENT_TYPE } from '../shared/constant';

dotenvConfig();

const env = (process.env.NODE_ENV ?? ENVIRONMENT_TYPE.DEVELOPMENT) as ValueOf<
  typeof ENVIRONMENT_TYPE
>;

const ENVIRONMENT = _.reduce(
  ENVIRONMENT_NAME[env],
  (prev, curr, key) => {
    Object.assign(prev, {
      [key]: process.env[curr],
    });

    return prev;
  },
  {} as Record<keyof (typeof ENVIRONMENT_NAME)[typeof env], string>
);

export default ENVIRONMENT;
