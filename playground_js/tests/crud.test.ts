// Import the necessary functions from the Firebase modular SDK
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { describe, beforeAll, afterAll, test, expect } from "@jest/globals";
import { db } from "../src/firebaseConfig"; // Assuming db is exported from firebaseConfig as shown previously
import { FirestoreDocument } from "../src/types";
import { RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { makeTestEnv } from "./helper";

// Define a collection name for demonstration purposes
const collectionName = "testCollection";

// Define a sample document ID and data for testing
const testDocId = "testDoc";
const testDocData: FirestoreDocument = {
  id: testDocId,
  // Add other document fields here for testing
};

describe("Firestore CRUD operations", () => {
  beforeAll(async () => {
  });

  afterAll(async () => {
    // Clean up after tests to remove the test document
    await deleteDoc(doc(db, collectionName, testDocId));
  });

  test("Create a document", async () => {
    await setDoc(doc(db, collectionName, testDocId), testDocData);
    const snapshot = await getDoc(doc(db, collectionName, testDocId));
    expect(snapshot.exists()).toBe(true);
    expect(snapshot.data()).toEqual(testDocData);
  });

  test("Read a document", async () => {
    const snapshot = await getDoc(doc(db, collectionName, testDocId));
    expect(snapshot.exists()).toBe(true);
    expect(snapshot.data()).toEqual(testDocData);
  });

  test("Update a document", async () => {
    const updatedData = { ...testDocData /* add updated fields here */ };
    await updateDoc(doc(db, collectionName, testDocId), updatedData);
    const snapshot = await getDoc(doc(db, collectionName, testDocId));
    expect(snapshot.exists()).toBe(true);
    expect(snapshot.data()).toEqual(updatedData);
  });

  test("Delete a document", async () => {
    await deleteDoc(doc(db, collectionName, testDocId));
    const snapshot = await getDoc(doc(db, collectionName, testDocId));
    expect(snapshot.exists()).toBe(false);
  });
});
