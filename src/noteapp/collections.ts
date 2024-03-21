// collections.ts
import {
  collection,
  doc,
  CollectionReference,
  DocumentReference,
  DocumentData,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { Note, User, noteConverter, userConverter } from "./types";

export const usersCollection: CollectionReference<User> = collection(
  db,
  "users"
).withConverter(userConverter);

// export const notesCollection = collection(db, 'notes').withConverter(
//   noteConverter
// );

export const getNotesCollection = (
  userId: string
): CollectionReference<Note> => {
  const userDocRef = doc(db, "users", userId);
  return collection(userDocRef, "notes").withConverter(noteConverter);
};

export const getNoteDoc = (userId: string, noteId: string):DocumentReference<Note> => {
  const noteDocRef = doc(db, "users", userId, "notes", noteId).withConverter(
    noteConverter
  );
  return noteDocRef;
};
