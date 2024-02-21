import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, setLogLevel } from "firebase/firestore";
import { makeTestEnv, saveFirestoreCoverage } from "./helper";

const firestoreRules = `
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザーのドキュメントに対するルール
    match /users/{userId} {
      // 読み書きのアクセス制御
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}

`;
describe("Firestore security rules", () => {
  let testEnv: RulesTestEnvironment;
  // テスト環境の初期化
  beforeAll(async () => {
    setLogLevel("error");
    testEnv = await makeTestEnv(firestoreRules);
  });

  // // テスト後のクリーンアップ
  afterAll(async () => {
    await testEnv.cleanup();
    await saveFirestoreCoverage(testEnv);
  });

  // 認証済みユーザー 'alice' が自分のドキュメントを読み書きできるかテスト
  test('allow authenticated user "alice" to read and write her document', async () => {
    const aliceContext = testEnv.authenticatedContext("alice");
    const aliceDocRef = doc(aliceContext.firestore(), "/users/alice");

    // 書き込みテスト
    await assertSucceeds(setDoc(aliceDocRef, { name: "Alice" }));

    // 読み取りテスト
    await assertSucceeds(getDoc(aliceDocRef));
  });

  // 未認証ユーザーが 'alice' のドキュメントを読めないことをテスト
  test('deny unauthenticated user to read "alice" document', async () => {
    const unauthenticatedContext = testEnv.unauthenticatedContext();
    const unauthDocRef = doc(
      unauthenticatedContext.firestore(),
      "/users/alice"
    );

    // 読み取りテスト
    await assertFails(getDoc(unauthDocRef));
  });
});
