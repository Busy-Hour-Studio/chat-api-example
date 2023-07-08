import { createCodeStatus } from '@krsbx/response-formatter';
import { Router } from 'express';
import asyncMw from 'express-asyncmw';
import { z } from 'zod';
import { sendGroupMessage } from '../event/messaging';
import schema from '../schema';
import { updateGroupTyping } from '../event/typing';
import { createGroup } from '../event/grouping';

const router = Router();

// POST /chats/group
router.post(
  '/group',
  asyncMw<{
    reqBody: z.infer<(typeof schema)['createGroup']>;
  }>(async (req, res) => {
    await createGroup(req.body);

    return res.status(200).json(createCodeStatus(200));
  })
);

// POST /chats/group/send
router.post(
  '/group/send',
  asyncMw<{
    reqBody: z.infer<(typeof schema)['groupMessage']>;
  }>(async (req, res) => {
    await sendGroupMessage(req.body);

    return res.status(200).json(createCodeStatus(200));
  })
);

// POST /chats/group/typing
router.post(
  '/group/typing',
  asyncMw<{
    reqBody: z.infer<(typeof schema)['groupTyping']>;
  }>(async (req, res) => {
    await updateGroupTyping(req.body);

    return res.status(200).json(createCodeStatus(200));
  })
);

export default router;
