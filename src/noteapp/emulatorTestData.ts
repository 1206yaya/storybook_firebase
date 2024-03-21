// emulatorTestData.ts
import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore";
import {
  upsertUser,
  fetchUser,
  fetchNote,
  fetchUsers,
  createNoteAndUpdateHome,
  shareNoteAndUpdateHome,
  unshareNoteAndUpdateHome,
  fetchHomeData,
} from "./database";
import { db } from "../firebaseConfig";


async function getDocumentSize(docPath: string) {
  const docRef = doc(db, docPath);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    const jsonString = JSON.stringify(data);
    const bytes = new TextEncoder().encode(jsonString).length;
    console.log(`Document size: ${bytes} bytes`);
  } else {
    console.log("Document does not exist.");
  }
}
async function deleteAllUsers() {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
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

// ユーザーIDを複数受け取り、それぞれのユーザーを作成または更新
export async function upsertUsers(users: { id: string; name: string }[]) {
  try {
    for (const user of users) {
      await upsertUser({
        id: user.id,
        name: user.name,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: null,
      });
      console.log(`User ${user.id} has been upserted.`);
    }
  } catch (err) {
    console.error("Failed to upsert users:", err);
  }
}
// console.logの簡略関数
function log(message: any) {
  console.log(message);
}

async function basicOperations() {
  const userId = "user123";
  const sharedUserId = "user456";
  const noteId = "note789";

  await deleteAllUsers();
  // ユーザーの作成
  await upsertUsers([
    { id: userId, name: "Test User123" },
    { id: sharedUserId, name: "Shared User" },
  ]);

  // ユーザー情報の取得
  log("Fetching user...");
  const users = await fetchUsers();
  users.forEach((user) => log(user));

  // ノートの作成
  await createNoteAndUpdateHome(userId, {
    id: noteId,
    title: "Test Note",
    content: "This is a test note.",
    createdAt: Timestamp.fromDate(new Date()),
    updatedAt: null,
    sharedWith: [],
    noteRef: "",
    ownerId: userId,
  });

  // ノートの取得
  const note = await fetchNote(userId, noteId);
  console.log("Note:", note);

  // ノートの共有
  await shareNoteAndUpdateHome(userId, noteId, sharedUserId);
  console.log(`Note shared with ${sharedUserId}`);

  // 共有の解除
  await unshareNoteAndUpdateHome(userId, noteId, sharedUserId);
  console.log(`Note unshared from ${sharedUserId}`);
}

// basicOperations().then(() => console.log("Test operations completed."));

// emulatorTestData.ts
// ...他のインポート...

async function testDatabaseOperations() {
  const userIdA = "userA";
  const userIdB = "userB";
  const noteIdA1 = "noteA1";
  const noteIdA2 = "noteA2";
  const noteIdB1 = "noteB1";
  const noteIdB2 = "noteB2";

  await deleteAllUsers();
  // ユーザーの作成
  await upsertUsers([
    { id: userIdA, name: "User A" },
    { id: userIdB, name: "User B" },
  ]);

  // ユーザー情報の取得
  log("Fetching users...");
  const users = await fetchUsers();
  users.forEach((user) => log(user));

  // ユーザーAのノート作成
  await createNoteAndUpdateHome(userIdA, {
    id: noteIdA1,
    title: "User A's Note 1",
    content: "This is User A's first note.",
    createdAt: Timestamp.fromDate(new Date()),
    updatedAt: null,
    sharedWith: [],
    noteRef: "",
    ownerId: userIdA,
  });
  await createNoteAndUpdateHome(userIdA, {
    id: noteIdA2,
    title: "User A's Note 2",
    content: "This is User A's second note.",
    createdAt: Timestamp.fromDate(new Date()),
    updatedAt: null,
    sharedWith: [],
    noteRef: "",
    ownerId: userIdA,
  });

  // ユーザーBのノート作成
  await createNoteAndUpdateHome(userIdB, {
    id: noteIdB1,
    title: "User B's Note 1",
    content: "This is User B's first note.",
    createdAt: Timestamp.fromDate(new Date()),
    updatedAt: null,
    sharedWith: [],
    noteRef: "",
    ownerId: userIdB,
  });
  await createNoteAndUpdateHome(userIdB, {
    id: noteIdB2,
    title: "User B's Note 2",
    content: "This is User B's second note.",
    createdAt: Timestamp.fromDate(new Date()),
    updatedAt: null,
    sharedWith: [],
    noteRef: "",
    ownerId: userIdB,
  });

  // ユーザーAの1つ目のノートをユーザーBと共有
  await shareNoteAndUpdateHome(userIdA, noteIdA1, userIdB);

  // ユーザーBの1つ目のノートをユーザーAと共有
  await shareNoteAndUpdateHome(userIdB, noteIdB1, userIdA);

  log("Sharing setup completed.");

  const userIdASize = getDocumentSize(`users/${userIdA}`);
  log(`User A's document size: ${userIdASize} bytes`);

  await fetchHomeData(userIdA);
}

testDatabaseOperations().then(() => console.log("Test operations completed."));
