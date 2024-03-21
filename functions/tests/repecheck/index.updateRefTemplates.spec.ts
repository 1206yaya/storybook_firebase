import { deleteAll, makeTestEnv } from "../../../tests/helper";
import { Firestore, deleteDoc, doc } from "firebase/firestore";
import { FirebaseFirestore } from "@firebase/firestore-types";
import {
  RulesTestEnvironment,
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from "@firebase/rules-unit-testing";

// 初期状態のテンプレートデータ
const initialTemplateData = {
  id: "templateA1",
  title: "Template A1",
  isShared: false, // 初期状態では共有されていない
  roles: {
    userA: "owner",
  },
  items: [
    {
      id: "itemA1-1",
      title: "Item A1-1",
    },
  ],
};

// 更新後のテンプレートデータ（`isShared`が`true`になり、新しい`editor`が追加される）
const updatedTemplateData = {
  ...initialTemplateData,
  isShared: true, // 共有される
  roles: {
    userA: "owner",
    userB: "editor", // 新しいeditorが追加
  },
};

// editorが削除された後のテンプレートデータ
const removedEditorTemplateData = {
  ...updatedTemplateData,
  roles: {
    userA: "owner",
  },
};

const updatedTemplateDataMultipleEditors = {
  ...initialTemplateData,
  isShared: true,
  roles: {
    userA: "owner",
    userB: "editor", // 新しいeditorが追加
    userC: "editor", // 別の新しいeditorが追加
  },
};
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
describe("updateRefTemplates function tests", () => {
  let db: FirebaseFirestore;
  let testEnv: RulesTestEnvironment;
  beforeAll(async () => {
    testEnv = await makeTestEnv(rule, "storybook-firebase-70993");
    db = testEnv.unauthenticatedContext().firestore();
  });
  afterAll(async () => {
    await deleteAll(db, "users");
    await testEnv.cleanup();
  });
  it("should create reference template for new editor", async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    // 初期状態のテンプレートを設定
    await db.doc("users/userA/templates/templateA1").set(initialTemplateData);

    // 更新後のテンプレートデータを適用
    await db.doc("users/userA/templates/templateA1").set(updatedTemplateData);
    await sleep(2000);
    // 参照テンプレートが作成されたことを確認
    const refTemplateDoc = await db
      .doc("users/userB/templates/templateA1")
      .get();
    expect(refTemplateDoc.exists).toBe(true);
    const refTemplateData = refTemplateDoc.data();
    // expect(refTemplateData.isRef).toBe(true);
  });

  it("should remove reference template when editor is removed", async () => {
    // editorが削除された後のテンプレートデータを適用
    await db
      .doc("users/userA/templates/templateA1")
      .set(removedEditorTemplateData);
    await sleep(2000);

    // 参照テンプレートが削除されたことを確認
    const refTemplateDoc = await db
      .doc("users/userB/templates/templateA1")
      .get();
    expect(refTemplateDoc.exists).toBe(false);
  });

  it("should create reference templates for multiple new editors", async () => {
    // 複数のeditorが追加された後のテンプレートデータを適用
    await db
      .doc("users/userA/templates/templateA1")
      .set(updatedTemplateDataMultipleEditors);
    await sleep(2000); // Firestoreの更新を待機

    // userB に対する参照テンプレートが作成されたことを確認
    const refTemplateDocUserB = await db
      .doc("users/userB/templates/templateA1")
      .get();
    expect(refTemplateDocUserB.exists).toBe(true);
    const refTemplateDataUserB = refTemplateDocUserB.data();
    expect(refTemplateDataUserB?.isRef).toBe(true); // isRefがtrueであることを確認

    // userC に対する参照テンプレートが作成されたことを確認
    const refTemplateDocUserC = await db
      .doc("users/userC/templates/templateA1")
      .get();
    expect(refTemplateDocUserC.exists).toBe(true);
    const refTemplateDataUserC = refTemplateDocUserC.data();
    expect(refTemplateDataUserC?.isRef).toBe(true); // isRefがtrueであることを確認
  });
});

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
