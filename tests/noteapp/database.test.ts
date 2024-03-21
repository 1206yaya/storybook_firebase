// Import the necessary functions from the Firebase modular SDK
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { describe, beforeAll, afterAll, test, expect } from "@jest/globals";
import { FirestoreDocument } from "../../src/types";
import { db } from "../../src/firebaseConfig";
import {
  getNote,
  getUser,
  shareNote,
  unshareNote,
  upsertNote,
  upsertUser,
} from "../../src/noteapp/database";
import { Note, User } from "../../src/noteapp/types";
import { DocumentSnapshot, DocumentData } from "firebase/firestore";
import { assertSucceeds } from "@firebase/rules-unit-testing";

describe("Firestore functions tests", () => {
  const testUserId = "testUser";
  const testNoteId = "testNote";

  const testUser = {
    id: testUserId,
    name: "Test User",
    createdAt: Timestamp.now(),
    updatedAt: null,
  };

  const testNote = {
    id: testNoteId,
    title: "Test Note",
    content: "This is a test note",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    sharedWith: [],
  };

  beforeAll(async () => {
    // テスト用ユーザーとノートをセットアップ
    await upsertUser(testUser);
    await upsertNote(testNote);
  });

  afterAll(async () => {
    // テストデータのクリーンアップ
    // await deleteDoc(doc(db, "users", testUserId));
    // await deleteDoc(doc(db, "notes", testNoteId));
  });

  test("User upsert and retrieve", async () => {
    // ユーザーの作成または更新と取得をテスト
    const userRef = doc(db, "users", testUserId);
    const docSnap = await getDoc(userRef);
    expect(docSnap.exists()).toBeTruthy();
    expect(docSnap.data()).toEqual(
      expect.objectContaining({
        name: "Test User",
      })
    );
  });

  test("Note upsert and retrieve", async () => {
    // ノートの作成または更新と取得をテスト
    const note = await getNote(testNoteId);
    expect(note).not.toBeUndefined();
    expect(note).toEqual(
      expect.objectContaining({
        title: "Test Note",
        content: "This is a test note",
      })
    );
  });

  test("Share a note", async () => {
    // ノートの共有をテスト
    await shareNote(testNoteId, "anotherUser");
    const note = await getNote(testNoteId);
    expect(note?.sharedWith).toContain("anotherUser");
  });

  test("Unshare a note", async () => {
    // ノートの共有解除をテスト
    await unshareNote(testNoteId, "anotherUser");
    const note = await getNote(testNoteId);
    expect(note?.sharedWith).not.toContain("anotherUser");
  });
});
