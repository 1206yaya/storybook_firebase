# 1

Firestore のデーアクセスに関する機能を試すためのプレイグラウンドを作成したい
ステップバイステップで進める
データ構造は Twitter を想定する
Twitter を想定したクエリを作成する

要件:

- Typescript
- Firebase JDK V10
- このプロジェクトは、起動済みのローカルエミュレーター上の Firestore を利用する
- jest を用いて実装を確認する

テストコードの例

```typescript
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
```

helper.ts

```typescript
import {
  RulesTestEnvironment,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";

const makeTestProjectID = (prefix = "test") => {
  const hrTime = process.hrtime();
  return `${prefix}${(hrTime[0] * 1000000 + hrTime[1] / 1000) * 1000}`;
};

export const makeTestEnv = async (firestoreRules: string) => {
  const testEnv = await initializeTestEnvironment({
    projectId: makeTestProjectID(),
    firestore: {
      rules: firestoreRules,
      host: "localhost",
      port: 8080,
    },
  });
  return testEnv;
};
```
