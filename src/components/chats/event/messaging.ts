import _ from 'lodash';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import Firebase from '../../../shared/Firebase';
import ENVIRONMENT from '../../../config/environment';
import { getSenderReceiverPath } from '../common';
import schema from '../schema';

export const chatBasePath = ENVIRONMENT.CHAT_BASE_PATH;

// #region SHARED

// #endregion

// #region PRIVATE
export async function sendPrivateMessage(
  payload: z.infer<(typeof schema)['privateMessage']>
): Promise<FirebaseFirestore.WriteResult[]> {
  const { senderId, receiverId, body, files } = payload;
  const { receiver, sender } = getSenderReceiverPath(payload);

  const message = _.defaults(
    {
      body,
      files,
      senderId,
      timestamp: Timestamp.now(),
    },
    {
      body: '',
      files: [],
    }
  );

  const metadata = {
    ...message,
    total: FieldValue.increment(1),
  };

  const { firestore } = Firebase.instance;

  const promises = [
    // Sender Side
    firestore.doc(sender.base).set(
      {
        [receiverId]: {
          ...metadata,
          uuid: senderId,
        },
      },
      { merge: true }
    ),
    firestore.doc(sender.message).set(message, {
      merge: true,
    }),
  ];

  // Receiver Side
  // Only run if not a private message to the sender itself
  if (receiverId !== senderId) {
    promises.push(
      firestore.doc(receiver.base).set(
        {
          [senderId]: {
            ...metadata,
            uuid: receiverId,
          },
        },
        { merge: true }
      ),
      firestore.doc(receiver.message).set(message, {
        merge: true,
      })
    );
  }

  return Promise.all(promises);
}
// #endregion

// #region GROUP
export async function sendGroupMessage(
  payload: z.infer<(typeof schema)['groupMessage']>
): Promise<
  [
    FirebaseFirestore.WriteResult,
    FirebaseFirestore.WriteResult,
    FirebaseFirestore.WriteResult
  ][]
> {
  const { senderId, uuid, body, files, members } = payload;

  const basePath = `${chatBasePath}/groups/users`;
  const timestamp = Timestamp.now();
  const messageUuid = uuidv4();

  const information = {
    timestamp,
  };

  const message = _.defaults(
    {
      body,
      files,
      senderId,
      timestamp,
    },
    {
      body: '',
      files: [],
    }
  );

  const metadata = {
    ...message,
    total: FieldValue.increment(1),
  };

  const { firestore } = Firebase.instance;

  return Promise.all(
    _.map(members, (member) => {
      const baseMemberPath = `${basePath}/${member}`;
      const groupPath = `${baseMemberPath}/groups/${uuid}`;

      return Promise.all([
        firestore
          .doc(`${groupPath}/messages/${messageUuid}`)
          .set(message, { merge: true }),
        firestore.doc(groupPath).set(information, { merge: true }),
        firestore.doc(baseMemberPath).set(
          {
            [uuid]: {
              ...metadata,
              uuid,
            },
          },
          { merge: true }
        ),
      ]);
    })
  );
}
// #endregion
