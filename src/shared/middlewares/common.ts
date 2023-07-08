import _ from 'lodash';
import { ZodError } from 'zod';
import { NextFunction } from 'express';
import asyncMw from 'express-asyncmw';
import { UniqueConstraintError, ValidationError } from 'sequelize';
import { createCodeStatus } from '@krsbx/response-formatter';
import SequelizeFQP from '@krsbx/sequelize-fqp';

export const queryParserMw = asyncMw<{
  reqQuery: {
    filters?: string;
  };
  extends: {
    filterQueryParams?: UnknownObject;
  };
}>(async (req, res, next) => {
  req.filterQueryParams = req.query.filters
    ? SequelizeFQP(req.query.filters)
    : {};
  delete req.query.filters;

  return next();
});

export const errorHandlerMw = (
  err: unknown,
  req: Express.Request,
  res: Express.Response,
  next: NextFunction
) => {
  if (!err) return next();

  if (
    err instanceof ZodError ||
    err instanceof ValidationError ||
    err instanceof UniqueConstraintError
  ) {
    return res.status(400).json(_.pick(err, ['name', 'errors']));
  }

  console.log(err);

  return res.status(500).json(createCodeStatus(500));
};
