import { config as dotenvConfig } from 'dotenv';
import path from 'path';
import admin from 'firebase-admin';
import { Query } from 'firebase-admin/firestore';
import { ASSETS_PATH } from './constant';

dotenvConfig();

class Firebase {
  // eslint-disable-next-line no-use-before-define
  private static _instance: Firebase;
  private _firebase: admin.app.App;
  private _firestore: admin.firestore.Firestore;
  private _messaging: admin.messaging.Messaging;
  private _storage: admin.storage.Storage;

  constructor() {
    this._firebase = admin.initializeApp({
      credential: admin.credential.cert(
        require(path.resolve(ASSETS_PATH, 'firebase-service-account.json'))
      ),
      storageBucket: process.env.STORAGE_BUCKET,
    });
    this._firestore = this.firebase.firestore();
    this._storage = this.firebase.storage();
    this._messaging = this.firebase.messaging();
  }

  public static get instance() {
    if (!Firebase._instance) Firebase._instance = new Firebase();

    return Firebase._instance;
  }

  public get firebase() {
    return this._firebase;
  }

  public get firestore() {
    return this._firestore;
  }

  public get storage() {
    return this._storage;
  }

  public get messaging() {
    return this._messaging;
  }

  public async deleteCollection(collectionPath: string) {
    const paths = collectionPath.split('/');

    if (paths.length % 2 === 0)
      throw Error("Collection path must have an odd /'s");

    const collectionRef = this.firestore.collection(collectionPath);

    await this.deleteQueryBatch(collectionRef);
    await collectionRef?.parent?.delete?.();
  }

  public async deleteQueryBatch(query: Query) {
    const snapshots = await query.get();

    const batchSize = snapshots.size;
    if (!batchSize) return;

    const batch = this.firestore.batch();

    snapshots.docs.forEach((doc) => batch.delete(doc.ref));

    await batch.commit();
  }

  public async sendNotification<T>(token: string, payload: T) {
    return this.messaging
      .send({
        token,
        data: {
          payload: JSON.stringify(payload),
        },
      })
      .catch(() => {
        // Do nothing if there is an error
      });
  }

  public async sendNotifications<T>(tokens: string[], payload: T) {
    return this.messaging
      .sendEachForMulticast({
        tokens,
        data: {
          payload: JSON.stringify(payload),
        },
      })
      .catch(() => {
        // Do nothing if there is an error
      });
  }
}

export default Firebase;
