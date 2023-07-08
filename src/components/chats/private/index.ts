import { createCodeStatus } from '@krsbx/response-formatter';
import { Router } from 'express';
import asyncMw from 'express-asyncmw';
import { z } from 'zod';
import { sendPrivateMessage } from '../event/messaging';
import schema from '../schema';
import { updatePrivateTyping } from '../event/typing';

const router = Router();

// POST /chats/private/send
router.post(
  '/private/send',
  asyncMw<{
    reqBody: z.infer<(typeof schema)['privateMessage']>;
  }>(async (req, res) => {
    await sendPrivateMessage(req.body);

    return res.status(200).json(createCodeStatus(200));
  })
);

// POST /chats/private/typing
router.post(
  '/private/typing',
  asyncMw<{
    reqBody: z.infer<(typeof schema)['privateTyping']>;
  }>(async (req, res) => {
    await updatePrivateTyping(req.body);

    return res.status(200).json(createCodeStatus(200));
  })
);

export default router;
