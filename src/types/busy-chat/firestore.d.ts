import type { FieldValue, Timestamp } from 'firebase-admin/firestore';

export type BaseStory = {
  body?: string;
  file?: {
    uri: string;
    type?: string | null;
    width?: number;
    height?: number;
  };
  userId: string;
  dislikes: string[];
  likes: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type MessageData = {
  senderId: string;
  timestamp: Timestamp;
  body: string;
  files: {
    uri: string;
    name: string;
    type?: string | null;
  }[];
};

export type PrivateMetadata = MessageData & {
  uuid: string; // receiverId
};

export type GroupMetadata = MessageData & {
  name: string;
  uuid: string;
  members: string[] | FieldValue;
  total: number;
};

export type Metadata =
  | {
      typing: string[] | FieldValue;
      timestamp: Timestamp;
    }
  | {
      members: string[] | FieldValue;
      timestamp: Timestamp;
      typing: string[] | FieldValue;
    };
