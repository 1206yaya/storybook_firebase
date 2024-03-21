import {
  RulesTestEnvironment,
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from "@firebase/rules-unit-testing";

import { deleteAll, makeTestEnv } from "../../../tests/helper";
import { Firestore, deleteDoc, doc } from "firebase/firestore";
import { FirebaseFirestore } from "@firebase/firestore-types";
import * as firebase from "@firebase/rules-unit-testing";
import { firebaseConfig, functions } from "../../../src/firebaseConfig";
import {
  Functions,
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
} from "firebase/functions";

const rule = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
`;

describe("syncSharedTemplateTitle Cloud Function", () => {
  let db: FirebaseFirestore;
  let testEnv: RulesTestEnvironment;
  beforeAll(async () => {
    testEnv = await makeTestEnv(rule, "storybook-firebase-70993");
    db = testEnv
      .authenticatedContext("userA", {
        email: "mandy@example.com",
      })
      .firestore();
  });

  afterAll(async () => {});
  it("updates shared template titles correctly", async () => {
    // テスト用のデータをセットアップ
    await db
      .doc("users/userB/templates/templateA1")
      .set({ title: "Original Title" });
    await db
      .doc("users/userC/templates/templateA1")
      .set({ title: "Original Title" });

    const syncSharedTemplateTitle = httpsCallable(
      functions,
      "syncSharedTemplateTitle"
    );
    const result = await syncSharedTemplateTitle({
      userId: "userA",
      templateId: "templateA1",
      title: "Updated Title",
      sharedWith: ["userB", "userC"],
    });
    sleep(1000);
    // 結果を検証
    expect(result).toBe(
      "Title update successfully synchronized with shared users."
    );

    // 更新されたタイトルを確認
    const docUserB = await db.doc("users/userB/templates/templateA1").get();
    const docUserC = await db.doc("users/userC/templates/templateA1").get();
    // expect(docUserB.data().title).toBe("Updated Title");
    // expect(docUserC.data().title).toBe("Updated Title");
  });
});

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
