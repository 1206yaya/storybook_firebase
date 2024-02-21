// models.ts
import { FirestoreDataConverter, Timestamp } from "firebase/firestore";

export type User = {
  id: string;
  name: string;
  createdAt: Timestamp;
  updatedAt: Timestamp | null;
};

export type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  sharedWith: string[]; // 共有ユーザーのIDの配列
};

export const userConverter: FirestoreDataConverter<User> = {
  toFirestore(user: User) {
    return { ...user };
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return { ...data } as User;
  },
};

export const noteConverter: FirestoreDataConverter<Note> = {
  toFirestore(note: Note) {
    return { ...note };
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return { ...data } as Note;
  },
};
