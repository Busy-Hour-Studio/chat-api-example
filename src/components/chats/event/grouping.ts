import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import _ from 'lodash';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import ENVIRONMENT from '../../../config/environment';
import Firebase from '../../../shared/Firebase';
import schema from '../schema';

export async function createGroup(
  payload: z.infer<(typeof schema)['createGroup']>
) {
  const basePath = `${ENVIRONMENT.CHAT_BASE_PATH}/groups/users`;
  const timestamp = Timestamp.now();
  const members = _.uniq(payload.members);
  const { name } = payload;

  const information = {
    members,
    timestamp,
    name,
  };

  const { firestore } = Firebase.instance;

  const uuid = uuidv4();

  return Promise.all(
    _.map(_.uniq(members), (member) =>
      Promise.all([
        firestore.doc(`${basePath}/${member}`).set(
          {
            [uuid]: {
              uuid,
              name,
            },
          },
          { merge: true }
        ),
        firestore
          .doc(`${basePath}/${member}/groups/${uuid}`)
          .set(information, { merge: true }),
      ])
    )
  );
}

export async function removeFromGroup(
  payload: z.infer<(typeof schema)['removeFromGroup']>
): Promise<FirebaseFirestore.WriteResult[]> {
  const { uuid } = payload;
  const members = (
    _.isArray(payload.members) ? payload.members : [payload.members]
  ) as string[];
  const filteredMember = payload.originalMembers.filter(
    (member) => !members.includes(member)
  );
  const basePath = `${ENVIRONMENT.CHAT_BASE_PATH}/groups/users`;

  const information = {
    members: FieldValue.arrayRemove(...members),
  };

  const recent = {
    [uuid]: FieldValue.delete(),
  };

  const { firestore } = Firebase.instance;

  return Promise.all([
    ..._.map(filteredMember, (member) =>
      firestore
        .doc(`${basePath}/${member}/groups/${uuid}`)
        .set(information, { merge: true })
    ),
    ..._.map(members, (member) =>
      firestore.doc(`${basePath}/${member}}`).set(recent, {
        merge: true,
      })
    ),
  ]);
}

export async function removeGroup(
  payload: z.infer<(typeof schema)['removeGroup']>
): Promise<FirebaseFirestore.WriteResult[]> {
  const { uuid, members } = payload;
  const basePath = `${ENVIRONMENT.CHAT_BASE_PATH}/groups/users`;

  const recent = {
    [uuid]: FieldValue.delete(),
  };

  const { firestore } = Firebase.instance;

  // Remove From Recent
  return Promise.all(
    _.map(members, (member) =>
      firestore.doc(`${basePath}/${member}`).set(recent, { merge: true })
    )
  );
}
