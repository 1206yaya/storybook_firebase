import { doc, setDoc, getDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { usersCollection, notesCollection } from "./collections";
import { User, Note } from "./types";

// ユーザーを作成または更新
export const upsertUser = async (user: User): Promise<void> => {
  const userRef = doc(usersCollection, user.id);
  await setDoc(userRef, user, { merge: true });
};

// ユーザーを取得
export async function getUser(userId: string): Promise<User | undefined> {
  const userRef = doc(usersCollection, userId);
  const docSnap = await getDoc(userRef);
  if (docSnap.exists()) {
    return docSnap.data() as User;
  } else {
    console.log("No such user!");
    return undefined;
  }
}

// ノートを作成または更新
export const upsertNote = async (note: Note): Promise<void> => {
  const noteRef = doc(notesCollection, note.id);
  await setDoc(noteRef, note, { merge: true });
};
// ノートを取得
export const getNote = async (noteId: string): Promise<Note | undefined> => {
  const noteRef = doc(notesCollection, noteId);
  const docSnap = await getDoc(noteRef);
  if (docSnap.exists()) {
    return docSnap.data() as Note;
  } else {
    return undefined;
  }
};

// ノートを共有する
export const shareNote = async (
  noteId: string,
  userId: string
): Promise<void> => {
  const noteRef = doc(notesCollection, noteId);
  await updateDoc(noteRef, {
    sharedWith: arrayUnion(userId),
  });
};

// ノートの共有を解除する
export const unshareNote = async (
  noteId: string,
  userId: string
): Promise<void> => {
  const noteRef = doc(notesCollection, noteId);
  await updateDoc(noteRef, {
    sharedWith: arrayRemove(userId),
  });
};
// ノートを更新
export async function updateNote(
  noteId: string,
  updates: Partial<Note>
): Promise<void> {
  const noteRef = doc(notesCollection, noteId);
  await updateDoc(noteRef, updates);
}

// ノートを削除
export async function deleteNote(noteId: string): Promise<void> {
  const noteRef = doc(notesCollection, noteId);
  await deleteDoc(noteRef);
}
