// types.ts
import {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  Timestamp,
} from "firebase/firestore";

export type ShareRequest = {
  id: string; // 共有リクエストの一意の識別子
  noteId: string; // 共有されるノートのID
  ownerId: string; // ノートの所有者（共有元ユーザー）のID
  sharedWithUserId: string; // 共有先ユーザーのID
  status: "pending" | "approved" | "rejected"; // リクエストのステータス
  createdAt: Timestamp; // 共有リクエストの作成日時
};
export const shareRequestConverter: FirestoreDataConverter<ShareRequest> = {
  toFirestore(shareRequest: ShareRequest): DocumentData {
    return { ...shareRequest };
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): ShareRequest {
    const data = snapshot.data(options);
    return { ...data } as ShareRequest;
  },
};

export type HomeData = {
  notes: Array<{
    title: string;
    noteId: string;
    sharedWith: string[];
    ownerId: string;
  }>;
};

export type User = {
  id: string;
  name: string;
  createdAt: Timestamp;
  updatedAt: Timestamp | null;
  home?: HomeData; // OptionalでHomeData型を追加
};

export const userConverter: FirestoreDataConverter<User> = {
  toFirestore(user: User) {
    // Firestoreに保存する際は、オプショナルフィールドでも問題なく扱える
    return { ...user };
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    // データの取得時に 'home' フィールドが存在しない場合でも適切にハンドルされる
    return { ...data } as User;
  },
};

export type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: Timestamp;
  updatedAt: Timestamp | null;
  sharedWith: string[]; // 共有ユーザーのIDの配列
  noteRef?: string; // ノートのリファレンス
  ownerId: string; // ノートの作成者のID
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
