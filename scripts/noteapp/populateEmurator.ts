import { RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { makeTestEnv } from "../../tests/helper";
import { setDoc } from "firebase/firestore";

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
const main = async () => {
  const testEnv: RulesTestEnvironment = await makeTestEnv(
    rule,
    "storybook-firebase-70993"
  );
  const db = testEnv.unauthenticatedContext().firestore();
  setDoc(db.doc("test/test"), { test: "test" });
  await testEnv.cleanup();
};

main();
