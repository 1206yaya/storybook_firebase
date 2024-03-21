import {
  RulesTestEnvironment,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import { getDocs, collection, deleteDoc } from "firebase/firestore";
import { FirebaseFirestore } from "@firebase/firestore-types";
export const generateRandomString = (): string => {
  let result = "";
  const characters = "abcdefghijklmnopqrstuvwxyz";
  const charactersLength = characters.length;
  for (let i = 0; i < 5; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const makeTestProjectID = (prefix = "test") => {
  const hrTime = process.hrtime();
  return `${prefix}${(hrTime[0] * 1000000 + hrTime[1] / 1000) * 1000}`;
};

export const makeTestEnv = async (
  firestoreRules: string,
  projectId?: string
): Promise<RulesTestEnvironment> => {
  const testEnv: RulesTestEnvironment = await initializeTestEnvironment({
    projectId: projectId ? projectId : makeTestProjectID(),
    firestore: {
      rules: firestoreRules,
      host: "localhost",
      port: 8080,
    },
  });
  return testEnv;
};
export async function deleteAll(db: FirebaseFirestore, collectionName: string) {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const deletePromises = querySnapshot.docs.map((doc) =>
      deleteDoc(doc.ref).catch((err) =>
        console.error(`Failed to delete user ${doc.id}:`, err)
      )
    );
    await Promise.all(deletePromises);
    console.log("All users have been deleted.");
  } catch (err) {
    console.error("Failed to delete all users:", err);
  }
}

import { createWriteStream } from "fs";
import http from "http";

// Firestoreエミュレータからカバレッジレポートを取得して保存するヘルパー関数
export const saveFirestoreCoverage = async (testEnv: RulesTestEnvironment) => {
  const coverageFile = "firestore-coverage.html";
  const fstream = createWriteStream(coverageFile);

  await new Promise((resolve, reject) => {
    const { host, port } = testEnv.emulators.firestore!; // ホストとポートを取得
    const quotedHost = host.includes(":") ? `[${host}]` : host; // ホストにコロンが含まれている場合はクォートする
    http.get(
      `http://${quotedHost}:${port}/emulator/v1/projects/${testEnv.projectId}:ruleCoverage.html`,
      (res) => {
        res.pipe(fstream, { end: true }); // レスポンスをファイルストリームにパイプ

        res.on("end", resolve);
        res.on("error", reject);
      }
    );
  }).catch((err) => console.error("Error saving Firestore coverage:", err));

  console.log(
    `Firestore rule coverage information appended to ${coverageFile}`
  );
};
