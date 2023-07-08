import _ from 'lodash';
import z from 'zod';

const schema = {
  get baseMessage() {
    return z
      .object({
        body: z.string().optional(),
        files: z
          .array(
            z.object({
              uri: z.string().url(),
              name: z.string(),
              type: z.string().optional().nullable(),
            })
          )
          .optional(),
      })
      .superRefine((values, ctx) => {
        if (!values.body && !values.files?.length) {
          ctx.addIssue({
            code: 'custom',
            path: ['body', 'file'],
            message: 'Body or File are required',
          });
        }
      });
  },

  // #region PRIVATE
  get privateMessage() {
    return z
      .object({
        senderId: z.string(),
        receiverId: z.string(),
      })
      .and(this.baseMessage);
  },

  get privateTyping() {
    return z.object({
      senderId: z.string(),
      receiverId: z.string(),
      typing: z.boolean(),
    });
  },
  // #endregion

  // #region GROUP
  get groupMessage() {
    return z
      .object({
        senderId: z.string(),
        uuid: z.string(),
        members: z.array(z.string()),
      })
      .and(this.baseMessage);
  },

  get groupTyping() {
    return z.object({
      senderId: z.string(),
      uuid: z.string(), // GROUP UUID
      members: z.array(z.string()),
      typing: z.boolean(),
    });
  },

  get createGroup() {
    return z.object({
      members: z
        .array(z.string())
        .min(2)
        .refine((members) => _.uniq(members).length >= 2, {
          message: 'Array must contain at least 2 unique element(s)',
        }),
      name: z.string(),
    });
  },

  get removeFromGroup() {
    return z.object({
      members: z.union([z.string(), z.array(z.string()).min(1)]),
      originalMembers: z.array(z.string()),
      senderId: z.string(),
      uuid: z.string(),
    });
  },

  get removeGroup() {
    return z.object({
      members: z.array(z.string()),
      senderId: z.string(),
      uuid: z.string(),
    });
  },
  // #endregion
};

export default _.omit(schema, ['baseMessage']);
