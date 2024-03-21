import { RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { makeTestEnv } from "../../tests/helper";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { FirebaseFirestore } from "@firebase/firestore-types";

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

const projectId = "storybook-firebase-70993";

async function fetchTemplates(db: FirebaseFirestore, userId: string) {
  const templatesRef = collection(db, `users/${userId}/templates`);
  const querySnapshot = await getDocs(templatesRef);
  const titles: string[] = [];
  querySnapshot.forEach((doc: any) => {
    titles.push(doc.data().title);
  });

  return titles;
}
async function fetchTemplate(
  db: FirebaseFirestore,
  userId: string,
  templateId: string
) {
  const templateRef = doc(db, `users/${userId}/templates/${templateId}`);
  const querySnapshot = await getDoc(templateRef);
  if (!querySnapshot.exists()) {
    console.log("No such document!");
    return null;
  }
  return querySnapshot.data();
}

// テンプレートを共有する
async function shareTemplate(
  db: FirebaseFirestore,
  userId: string,
  templateId: string,
  sharedWith: string
) {
  const templateRef = doc(db, `users/${userId}/templates/${templateId}`);

  await setDoc(
    templateRef,
    { isShared: true, roles: { [userId]: "owner", [sharedWith]: "editor" } },
    { merge: true }
  );
}

//* Executions
// execFetchTemplates: fetchTemplatesを実行しての結果を表示する
async function execFetchTemplates() {
  const testEnv: RulesTestEnvironment = await makeTestEnv(rule, projectId);
  const db = testEnv.unauthenticatedContext().firestore();
  const userId = "userA";
  fetchTemplates(db, userId)
    .then((titles) => {
      console.log(`${userId} template titles:`, titles);
    })
    .catch((error) => {
      console.error(`Error listing template titles for ${userId}`, error);
    });
}

// execShareTemplate: shareTemplateを実行しての結果を表示する
async function execShareTemplate() {
  const testEnv: RulesTestEnvironment = await makeTestEnv(rule, projectId);
  const db = testEnv.unauthenticatedContext().firestore();
  const userId = "userA";
  const templateId = "templateA2";
  const shearedWith = "userB";
  await shareTemplate(db, userId, templateId, shearedWith);
  const updatedTemplate = await fetchTemplate(db, userId, templateId);
  console.log("Updated template:", updatedTemplate);
}

// execFetchTemplates();
execShareTemplate();
