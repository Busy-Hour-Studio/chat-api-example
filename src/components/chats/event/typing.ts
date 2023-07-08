import { FieldValue } from 'firebase-admin/firestore';
import _ from 'lodash';
import { z } from 'zod';
import ENVIRONMENT from '../../../config/environment';
import Firebase from '../../../shared/Firebase';
import { getSenderReceiverPath } from '../common';
import schema from '../schema';

export async function updatePrivateTyping(
  payload: z.infer<(typeof schema)['privateTyping']>
): Promise<FirebaseFirestore.WriteResult[]> {
  const { receiver, sender } = getSenderReceiverPath(payload);
  const typing = payload.typing
    ? FieldValue.arrayUnion(payload.senderId)
    : FieldValue.arrayRemove(payload.senderId);

  const information = {
    typing,
  };

  const { firestore } = Firebase.instance;

  return Promise.all([
    firestore.doc(sender.information).set(information, { merge: true }),
    firestore.doc(receiver.information).set(information, { merge: true }),
  ]);
}

export async function updateGroupTyping(
  payload: z.infer<(typeof schema)['groupTyping']>
): Promise<FirebaseFirestore.WriteResult[]> {
  const { uuid, senderId, members } = payload;

  const typing = payload.typing
    ? FieldValue.arrayUnion(senderId)
    : FieldValue.arrayRemove(senderId);

  const basePath = `${ENVIRONMENT.CHAT_BASE_PATH}/groups/users`;

  const information = {
    typing,
  };

  const { firestore } = Firebase.instance;

  return Promise.all(
    _.map(members, (member) =>
      firestore
        .doc(`${basePath}/${member}/groups/${uuid}`)
        .set(information, { merge: true })
    )
  );
}
