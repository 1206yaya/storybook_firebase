// collections.ts
import { collection } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { userConverter } from "./types";

export const usersCollection = collection(db, "users").withConverter(
  userConverter
);
