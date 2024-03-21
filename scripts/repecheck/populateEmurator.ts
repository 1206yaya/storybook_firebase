import { RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { makeTestEnv } from "../../tests/helper";
import { collection, doc, setDoc, writeBatch } from "firebase/firestore";
import { FirebaseFirestore } from "@firebase/firestore-types";
import { data } from "./mockData"; // 前提として型定義をインポート
import {
  Data,
  User,
  Template,
  Roles,
  Item,
} from "../../functions/src/shared/repecheck/types";
// テストデータ登録用に全許可ルールを設定
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

async function populateDataRecursivelyv1(
  db: FirebaseFirestore,
  data: any,
  path: string = ""
) {
  const batch = writeBatch(db);

  const populate = (data: any, parentPath: string) => {
    Object.keys(data).forEach((key) => {
      if (Array.isArray(data[key])) {
        data[key].forEach((item: any) => {
          const docPath = parentPath
            ? `${parentPath}/${key}/${item.id}`
            : `${key}/${item.id}`;
          const docRef = doc(db, docPath);
          let itemData = { ...item };
          delete itemData.children; // 子要素を除外して登録
          batch.set(docRef, itemData);

          // 子要素があれば再帰的に処理
          if (item.children) {
            populate(item.children, docPath);
          }
        });
      }
    });
  };

  populate(data, path);

  await batch.commit();
  console.log("Data successfully populated to Firestore.");
}

async function populateDataRecursively(
  db: FirebaseFirestore,
  data: { users: User[] }, // 型を適用
  parentPath: string = ""
) {
  const batch = writeBatch(db);

  const populateUsersAndTemplates = (users: User[], basePath: string) => {
    users.forEach((user) => {
      const userRef = doc(db, `${basePath}/users/${user.id}`);
      batch.set(userRef, { name: user.name });

      user.templates.forEach((template) => {
        const templateRef = doc(db, `${userRef.path}/templates/${template.id}`);
        batch.set(templateRef, {
          title: template.title,
          ...(typeof template.isRef !== "undefined" && {
            isRef: template.isRef,
          }),
          ...(template.roles && { roles: template.roles }),
          ...(typeof template.isShared !== "undefined" && {
            isShared: template.isShared,
          }),
        });
      });
    });
  };

  populateUsersAndTemplates(data.users, "");

  await batch.commit();
  console.log("Data successfully populated to Firestore.");
}

const main = async () => {
  const testEnv: RulesTestEnvironment = await makeTestEnv(
    rule,
    "storybook-firebase-70993"
  );
  const db = testEnv.unauthenticatedContext().firestore();
  populateDataRecursively(db, data);
  // await testEnv.cleanup();
};

main();
