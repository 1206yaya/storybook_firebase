import { collection } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { noteConverter, userConverter } from "./types";


export const usersCollection = collection(db, 'users').withConverter(
  userConverter
);

export const notesCollection = collection(db, 'notes').withConverter(
  noteConverter
);
