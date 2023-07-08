import cors from 'cors';
import express, { Express } from 'express';
import { errorHandlerMw, queryParserMw } from './middlewares/common';
import privateRoute from '../components/chats/private';
import groupRoute from '../components/chats/group';

const root = (app: Express) => {
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(express.static('public'));
  app.use(cors());

  app.get('*', queryParserMw);
  app.use('/chats', privateRoute);
  app.use('/chats', groupRoute);

  app.use(errorHandlerMw);
};

export default root;
