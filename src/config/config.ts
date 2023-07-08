import _ from 'lodash';
import {
  ENVIRONMENT_NAME,
  ENVIRONMENT_TYPE,
  DB_CONFIG_KEY,
  DB_CONFIG_VALUE,
} from '../shared/constant';

const DB_CONFIG_MAP = _.reduce(
  ENVIRONMENT_NAME,
  (config, curr, key) => {
    const type = key as ValueOf<typeof ENVIRONMENT_TYPE>;

    config[type] = _.reduce(
      DB_CONFIG_KEY,
      (prev, _key) => {
        const isDialect = _key === DB_CONFIG_KEY.DIALECT;

        const name = isDialect ? DB_CONFIG_KEY.DIALECT : DB_CONFIG_VALUE[_key];
        const value = isDialect ? 'postgres' : process.env[curr[name as never]];

        prev[_key] = value as string;

        return prev;
      },
      {} as Record<ValueOf<typeof DB_CONFIG_KEY>, string>
    );

    return config;
  },
  {} as Record<
    ValueOf<typeof ENVIRONMENT_TYPE>,
    Record<ValueOf<typeof DB_CONFIG_KEY>, string>
  >
);

export = DB_CONFIG_MAP;
