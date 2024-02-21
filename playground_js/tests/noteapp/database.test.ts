// Import the necessary functions from the Firebase modular SDK
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { describe, beforeAll, afterAll, test, expect } from "@jest/globals";
import { FirestoreDocument } from "../../src/types";
import { db } from "../../src/firebaseConfig";
import { createUser, getUser } from "../../src/noteapp/database";
import { User } from "../../src/noteapp/types";
import { DocumentSnapshot, DocumentData } from "firebase/firestore";

const testUserId = "testUser";
const testUserData: User = {
  id: testUserId,
  name: "Test User",
  createdAt: Timestamp.now(),
  updatedAt: null,
};

describe("User Model operations", () => {
  test("Create User", async () => {
    await createUser(testUserData);
    const userDocRef = doc(db, "users", testUserId);
    const docSnap: DocumentSnapshot<DocumentData> = await getDoc(userDocRef);

    expect(docSnap.exists()).toBeTruthy();
    const userData = docSnap.data();
    expect(userData).toMatchObject({
      name: "Test User",
      // createdAtとupdatedAtはテストの実行タイミングによって異なるため、ここでは具体的な値のチェックを省略します
    });
  });

  test("Get User retrieves the correct user data", async () => {
    const userData = await getUser(testUserId);

    expect(userData).toBeDefined();
    expect(userData).toMatchObject({
      id: testUserId,
      name: "Test User",
    });
  });
});
