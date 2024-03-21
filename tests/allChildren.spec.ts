import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { makeTestEnv, saveFirestoreCoverage } from "./helper";

// テスト環境のセットアップとルールの定義は省略
const firestoreRules = `
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザーが自分のドキュメントにアクセスできる
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;

      // // ユーザーのpostsサブコレクション以下のすべてに対して再帰的にルールを適用
      match /posts/{allChildren=**} {
        allow read, write: if request.auth.uid == userId;
      }
    }
  }
}

`;

describe("Firestore security rules for posts and histories subcollections", () => {
  let testEnv: RulesTestEnvironment;

  beforeAll(async () => {
    testEnv = await makeTestEnv(firestoreRules);
  });

  afterAll(async () => {
    await testEnv.cleanup();

    await saveFirestoreCoverage(testEnv);
  });

  // ユーザーが自分のpostsサブコレクションにアクセスできるかテスト
  test("allow user to access their own posts subcollection", async () => {
    const aliceContext = testEnv.authenticatedContext("alice");
    const alicePostsRef = doc(
      aliceContext.firestore(),
      "users/alice/posts/post1"
    );
    await assertSucceeds(setDoc(alicePostsRef, { content: "Alice's post" }));
  });

  // ユーザーが自分のpostsサブコレクション以下のhistoriesにアクセスできるかテスト
  test("allow user to access their own posts subcollection histories", async () => {
    const aliceContext = testEnv.authenticatedContext("alice");
    const aliceHistoryRef = doc(
      aliceContext.firestore(),
      "users/alice/posts/post1/histories/history1"
    );
    await assertSucceeds(setDoc(aliceHistoryRef, { edit: "First edit" }));
  });

  // 他のユーザーが特定のユーザーのpostsサブコレクションにアクセスできないことをテスト
  test("deny other user from accessing a user's posts subcollection", async () => {
    const bobContext = testEnv.authenticatedContext("bob");
    const alicePostsRef = doc(
      bobContext.firestore(),
      "users/alice/posts/post1"
    );
    await assertFails(getDoc(alicePostsRef));
  });

  // 他のユーザーがpostsサブコレクション以下のhistoriesにアクセスできないことをテスト
  test("deny other user from accessing a user's posts subcollection histories", async () => {
    const bobContext = testEnv.authenticatedContext("bob");
    const aliceHistoryRef = doc(
      bobContext.firestore(),
      "users/alice/posts/post1/histories/history1"
    );
    await assertFails(getDoc(aliceHistoryRef));
  });
});
