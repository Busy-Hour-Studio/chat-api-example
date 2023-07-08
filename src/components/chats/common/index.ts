import { v4 as uuidv4 } from 'uuid';
import ENVIRONMENT from '../../../config/environment';

export function getSenderReceiverPath(payload: {
  senderId: string;
  receiverId: string;
}): {
  sender: {
    readonly base: string;
    readonly information: string;
    readonly message: string;
  };
  receiver: {
    readonly base: string;
    readonly information: string;
    readonly message: string;
  };
} {
  const { receiverId, senderId } = payload;

  const messageUuid = uuidv4();

  const basePath = `${ENVIRONMENT.CHAT_BASE_PATH}/privates/users`;

  const sender = {
    get base() {
      return `${basePath}/${senderId}`;
    },
    get information() {
      return `${this.base}/${receiverId}/information`;
    },
    get message() {
      return `${this.information}/messages/${messageUuid}`;
    },
  };

  const receiver = {
    get base() {
      return `${basePath}/${receiverId}`;
    },
    get information() {
      return `${this.base}/${senderId}/information`;
    },
    get message() {
      return `${this.information}/messages/${messageUuid}`;
    },
  };

  return { sender, receiver };
}
