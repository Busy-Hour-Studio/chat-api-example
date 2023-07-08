import fs from 'fs';
import path from 'path';
import { Sequelize, DataTypes } from 'sequelize';
import process from 'process';
import { Database } from 'sequelize-db-type/helper';
import appRootPath from 'app-root-path';
import { ENVIRONMENT_TYPE } from '../shared/constant';
import { hasOwnProperty } from '../shared/common';

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || ENVIRONMENT_TYPE.DEVELOPMENT;
const config = require(path.resolve(appRootPath.path, 'dist/config/config.js'))[
  env
];

const db: Database = {} as Database;

const sequelize = config.use_env_variable
  ? new Sequelize(process.env[config.use_env_variable] ?? '', config)
  : new Sequelize(config.database, config.username, config.password, config);

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file)).default(
      sequelize,
      DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  const model = db[modelName];

  if (!hasOwnProperty<(_db: unknown) => void>(model, 'associate')) return;

  model?.associate?.(db);
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
