import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
} from "firebase/firestore";

import { makeTestEnv, saveFirestoreCoverage } from "./helper";


const firestoreRules = `
service cloud.firestore {
  match /databases/{database}/documents {
    // すべてのユーザーが自分のプロファイルを読み書きできる
    match /users/{userId} {
      allow read: if request.auth.uid != null;
      allow write: if request.auth.uid == userId;
    }

    // ユーザー自身のみが自分のサブコレクション 'privateData' にアクセスできる
    match /users/{userId}/privateData/{document=**} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
`;

describe("Firestore security rules for users and privateData", () => {
  let testEnv: RulesTestEnvironment;

  beforeAll(async () => {
    testEnv = await makeTestEnv(firestoreRules);
  });

  afterAll(async () => {
    await testEnv.cleanup();

    await saveFirestoreCoverage(testEnv);
  });

  // 他のユーザーのプロファイルを読むことができるかテスト
  test("allow authenticated user to read another user's profile", async () => {
    const aliceContext = testEnv.authenticatedContext("alice");
    const bobProfileRef = doc(aliceContext.firestore(), "users/bob");

    await assertSucceeds(getDoc(bobProfileRef));
  });

  // ユーザーが自分の `privateData` にアクセスできるかテスト
  test("allow authenticated user to access their own privateData", async () => {
    const aliceContext = testEnv.authenticatedContext("alice");
    const alicePrivateDataRef = doc(
      aliceContext.firestore(),
      "users/alice/privateData/privateDoc"
    );

    await assertSucceeds(setDoc(alicePrivateDataRef, { data: "secret" }));
    await assertSucceeds(getDoc(alicePrivateDataRef));
  });

  // 他のユーザーが `privateData` にアクセスできないことをテスト
  test("deny authenticated user to access another user's privateData", async () => {
    const aliceContext = testEnv.authenticatedContext("alice");
    const bobPrivateDataRef = doc(
      aliceContext.firestore(),
      "users/bob/privateData/privateDoc"
    );

    await assertFails(getDoc(bobPrivateDataRef));
  });
});
