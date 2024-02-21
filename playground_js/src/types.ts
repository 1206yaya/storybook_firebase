// src/types.ts

// Define a generic interface for the Firestore documents you will be working with.
// This is a placeholder and should be replaced with actual document structure as needed.
export interface FirestoreDocument {
  id: string; // Assuming each document will have an ID field
  // Add other document fields here
  // e.g., name: string;
  //       createdAt: firebase.firestore.Timestamp;
  //       updatedAt: firebase.firestore.Timestamp;
}

// You can also define specific interfaces for different collections if needed.
// For example, if you have a 'users' collection, you might define a User interface:
/*
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: firebase.firestore.Timestamp;
  updatedAt: firebase.firestore.Timestamp;
}
*/

// If you have specific CRUD operation types, you can define them here as well.
// For example, for a create operation, you might exclude the 'id' field:
/*
export interface CreateUserInput {
  name: string;
  email: string;
  // Other fields required to create a User, excluding the 'id'
}
*/

// Similarly, for update operations, you might define what fields can be updated:
/*
export interface UpdateUserInput {
  name?: string;
  email?: string;
  // Other updatable fields, all optional
}
*/

// Remember to replace the placeholder types and interfaces with actual ones based on your project's needs.
