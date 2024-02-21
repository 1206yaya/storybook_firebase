import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  Firestore,
} from "firebase/firestore";

import { FirestoreDocument } from "./types";

//* v9
// Define a collection name for demonstration purposes
const collectionName = "demoCollection";

// CRUD operations for Firestore

async function createDocument(
  firestore: Firestore,
  collectionName: string,
  data: Omit<FirestoreDocument, "id">
): Promise<FirestoreDocument> {
  const docRef = await addDoc(collection(firestore, collectionName), data);
  const snapshot = await getDoc(docRef);
  return { id: docRef.id, ...snapshot.data() } as FirestoreDocument;
}

async function readDocument(
  firestore: Firestore,
  collectionName: string,
  id: string
): Promise<FirestoreDocument | undefined> {
  const docRef = doc(firestore, collectionName, id);
  const snapshot = await getDoc(docRef);
  return snapshot.exists()
    ? ({ id: snapshot.id, ...snapshot.data() } as FirestoreDocument)
    : undefined;
}

async function updateDocument(
  firestore: Firestore,
  collectionName: string,
  id: string,
  data: Partial<FirestoreDocument>
): Promise<void> {
  const docRef = doc(firestore, collectionName, id);
  await updateDoc(docRef, data);
}

async function deleteDocument(
  firestore: Firestore,
  collectionName: string,
  id: string
): Promise<void> {
  const docRef = doc(firestore, collectionName, id);
  await deleteDoc(docRef);
}

// Export the CRUD operations for testing
export { createDocument, readDocument, updateDocument, deleteDocument };

// Example usage (uncomment to use)
/*
(async () => {
  try {
    // Create a new document
    const newDoc = await createDocument({ /* data without id *\/ });
    console.log('Document created:', newDoc);

    // Read the document
    const readDoc = await readDocument(newDoc.id);
    console.log('Document read:', readDoc);

    // Update the document
    await updateDocument(newDoc.id, { /* updated data *\/ });
    console.log('Document updated');

    // Delete the document
    await deleteDocument(newDoc.id);
    console.log('Document deleted');
  } catch (error) {
    console.error('Error in Firestore operations:', error);
  }
})();
*/
