// // emulatorTestData.ts
// import { app, db } from "../firebaseConfig";
// import { upsertUser, upsertNote, shareNote } from "./database";
// import { Timestamp, terminate } from "firebase/firestore";

// (async () => {
//   // テストユーザーのデータ
//   const testUsers = [
//     {
//       id: "user1",
//       name: "User One",
//       createdAt: Timestamp.now(),
//       updatedAt: null,
//     },
//     {
//       id: "user2",
//       name: "User Two",
//       createdAt: Timestamp.now(),
//       updatedAt: null,
//     },
//   ];

//   // テストノートのデータ
//   const testNotes = [
//     {
//       id: "note1",
//       title: "Test Note 1",
//       content: "This is the first test note",
//       createdAt: Timestamp.now(),
//       updatedAt: Timestamp.now(),
//       sharedWith: [],
//     },
//     {
//       id: "note2",
//       title: "Test Note 2",
//       content: "This is the second test note",
//       createdAt: Timestamp.now(),
//       updatedAt: Timestamp.now(),
//       sharedWith: ["user2"],
//     },
//   ];

//   // テストユーザーを登録
//   for (const user of testUsers) {
//     await upsertUser(user);
//     console.log(`User ${user.id} has been upserted.`);
//   }

//   // テストノートを各ユーザーに対して登録
//   // 注: このサンプルでは、ノートを作成するユーザーは'user1'と仮定しています。
//   for (const note of testNotes) {
//     // ノートの作成者 'user1' を指定
//     await upsertNote("user1", note);
//     console.log(`Note ${note.id} has been upserted for user user1.`);
//   }

//   // ノートの共有
//   // 注: このサンプルでは、'user1' が 'user2' と共有するシナリオを想定しています。
//   // 'note1' を 'user1' から 'user2' へ共有
//   await shareNote("user1", "note1", "user2");
//   console.log("Note note1 has been shared with user2 by user1.");

//   terminate(db);
//   console.log("Firebase app has been terminated.");
// })();
