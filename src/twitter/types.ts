// types.ts
import type { Timestamp, FirestoreDataConverter } from "firebase/firestore";
//* https://github.com/ccrsxx/twitter-clone/blob/main/src/lib/types/user.ts
export type User = {
  id: string;
  name: string;

  createdAt: Timestamp;
  updatedAt: Timestamp | null;
};

export type EditableData = Extract<keyof User, "name">;

export type EditableUserData = Pick<User, EditableData>;

export const userConverter: FirestoreDataConverter<User> = {
  toFirestore(user) {
    return { ...user };
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return { ...data } as User;
  },
};
