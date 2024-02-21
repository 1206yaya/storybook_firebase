// database.ts
import {
  doc,
  getDoc,
  setDoc,
  FirestoreDataConverter,
} from "firebase/firestore";
import { User, userConverter, Note, noteConverter } from "./types";
import { db } from "../firebaseConfig";

const usersCollection = "users";
const notesCollection = "notes";

export async function getUser(userId: string): Promise<User | undefined> {
  const docRef = doc(db, usersCollection, userId).withConverter(userConverter);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    console.log("No such document!");
    return undefined;
  }
}

export async function createUser(user: User): Promise<void> {
  console.log("db.app.name = ", db.app.name);
  const docRef = doc(db, usersCollection, user.id).withConverter(userConverter);
  await setDoc(docRef, user);
}

export async function createNote(note: Note): Promise<void> {
  const docRef = doc(db, notesCollection, note.id).withConverter(noteConverter);
  await setDoc(docRef, note);
}

// 他の必要な操作（ノートの取得、更新、共有など）も同様に実装
