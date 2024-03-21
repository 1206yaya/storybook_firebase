// database.ts
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { User, Note, HomeData, userConverter } from "./types"; // 仮定の型定義

// ユーザーを作成または更新
export const upsertUser = async (user: User): Promise<void> => {
  const userRef = doc(db, "users", user.id);
  await setDoc(userRef, user, { merge: true });
};

// ユーザー一覧の取得
export const fetchUsers = async (): Promise<User[]> => {
  const usersRef = collection(db, "users");
  const querySnapshot = await getDocs(usersRef);
  return querySnapshot.docs.map((doc) => doc.data() as User);
};

// ユーザーを取得
export async function fetchUser(userId: string): Promise<User | undefined> {
  const userRef = doc(db, "users", userId);
  const docSnap = await getDoc(userRef);
  return docSnap.exists() ? (docSnap.data() as User) : undefined;
}

// ユーザーのノート一覧の取得（更新日時でソート）
export const fetchUserNotes = async (
  userId: string,
  sortBy: "createdAt" | "updatedAt" = "updatedAt"
): Promise<Note[]> => {
  const notesRef = collection(db, `users/${userId}/notes`);
  const q = query(notesRef, orderBy(sortBy, "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => doc.data() as Note);
};

// 個別ノートの取得
export const fetchNote = async (
  userId: string,
  noteId: string
): Promise<Note | undefined> => {
  const noteRef = doc(db, `users/${userId}/notes/${noteId}`);
  const docSnap = await getDoc(noteRef);
  return docSnap.exists() ? (docSnap.data() as Note) : undefined;
};
// ユーザーのhomeフィールドのデータを取得
export const fetchHomeData = async (
  userId: string
): Promise<HomeData | null> => {
  const userRef = doc(db, `users/${userId}`).withConverter<User>(userConverter);
  const docSnap = await getDoc(userRef);

  if (docSnap.exists()) {
    const user = docSnap.data(); // userConverterを通じてUser型として取得
    if (user.home) {
      console.log(`Home data for ${userId}:`, user.home);
      return user.home; // HomeData型として返す
    } else {
      console.log(`Home data for ${userId} is undefined.`);
      return null;
    }
  } else {
    console.log(`No such document for ${userId}`);
    return null;
  }
};

// プライベート関数: ノートの作成
const _createNote = async (userId: string, note: Note): Promise<void> => {
  await setDoc(doc(db, `users/${userId}/notes/${note.id}`), note);
};

// ノートの作成とホームデータの更新
export const createNoteAndUpdateHome = async (
  userId: string,
  note: Note
): Promise<void> => {
  await _createNote(userId, note); // プライベート関数を使用

  // ホームデータの更新
  const userRef = doc(db, `users/${userId}`);
  const homeNoteSummary = {
    title: note.title,
    noteId: note.id,
    sharedWith: note.sharedWith,
    ownerId: note.ownerId,
  };
  await updateDoc(userRef, {
    "home.notes": arrayUnion(homeNoteSummary),
  });
};

// ノートの更新
export const updateNote = async (
  userId: string,
  noteId: string,
  note: Partial<Note>
): Promise<void> => {
  const noteRef = doc(db, `users/${userId}/notes/${noteId}`);
  await updateDoc(noteRef, note);
};

// ノートの削除とホームデータの更新
export const deleteNoteAndUpdateHome = async (
  userId: string,
  noteId: string
): Promise<void> => {
  await deleteDoc(doc(db, `users/${userId}/notes/${noteId}`));

  // ホームデータの更新
  const userRef = doc(db, `users/${userId}`);
  await updateDoc(userRef, {
    "home.notes": arrayRemove({ noteId: noteId }), // 削除するノートのIDを指定
  });
};

// ノートの共有とホームデータの更新
export const shareNoteAndUpdateHome = async (
  ownerId: string,
  noteId: string,
  sharedWithUserId: string
): Promise<void> => {
  const originalNoteRef = doc(db, `users/${ownerId}/notes/${noteId}`);
  await updateDoc(originalNoteRef, {
    sharedWith: arrayUnion(sharedWithUserId),
  });

  // 共有先ユーザーのホームデータにノート概要を追加
  const sharedUserRef = doc(db, `users/${sharedWithUserId}`);
  const docSnap = await getDoc(originalNoteRef);
  if (docSnap.exists()) {
    const note = docSnap.data() as Note;
    const homeNoteSummary = { title: note.title, noteId: note.id };
    await updateDoc(sharedUserRef, {
      "home.notes": arrayUnion(homeNoteSummary),
    });
  }
};

// 共有の解除とホームデータの更新
export const unshareNoteAndUpdateHome = async (
  ownerId: string,
  noteId: string,
  sharedWithUserId: string
): Promise<void> => {
  // 共有の解除
  const originalNoteRef = doc(db, `users/${ownerId}/notes/${noteId}`);
  await updateDoc(originalNoteRef, {
    sharedWith: arrayRemove(sharedWithUserId),
  });

  // 共有先ユーザーのホームデータからノート概要を削除
  const sharedUserRef = doc(db, `users/${sharedWithUserId}`);
  await updateDoc(sharedUserRef, {
    "home.notes": arrayRemove({ noteId: noteId }), // 削除するノートのIDを指定
  });
};
