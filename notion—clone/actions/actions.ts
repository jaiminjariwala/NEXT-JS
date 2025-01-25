/* This file contains a server action to handle the creation of new documents for authenticated users. */

"use server"; // it's a directive indicates that this file will run on the server

import { adminDb } from "../firebase/firebase-admin"; // allows access to the dB for performing server side operations.
import { auth } from "@clerk/nextjs/server"; // for user authentication & redirects unauthenticated users to the sign-in page
import { redirect } from "next/navigation"; // nextjs function useful when a user needs to be navigated to another page.

// below function creates a new document & handles 1. Authentication 2. Firestore Document Creation 3. Nested user-specific metadata creation.
export async function createNewDocument() {
  // if the user tries to "Create a New Document without Login/Sign-Up that is authenticate", the below code will thow the user to the CLERK Login screen!

  // "auth()" function retrieves authentication details about current user. If the user isn't authenticated, the returned SessionClaims will be empty or undefined.
  const { sessionClaims } = await auth();

  // check if user is authenticated by extracting the email, if not, redirect to sign-in page
  if (!sessionClaims?.email) {
    redirect("/sign-in");
  }

  // access documents collection in Firestore
  const docCollectionRef = adminDb.collection("documents");
  const docRef = await docCollectionRef.add({
    title: "New Doc",
    userId: sessionClaims?.email!,
  });

  await adminDb
    .collection("users")
    .doc(sessionClaims.email as string)
    .collection("rooms")
    .doc(docRef.id)
    .set({
      userId: sessionClaims.email as string,
      role: "owner",
      createdAt: new Date(),
      roomId: docRef.id,
    });

  // Return the document ID
  return { docId: docRef.id };
}
