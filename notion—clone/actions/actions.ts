/* This file contains a server action to handle the actual logic of creating the new documents for authenticated users in Firestore. */

"use server"; // it's a directive indicates that this file will run on the server

// adminDb: Firestore admin instance for server-side database operations.
import { adminDb } from "../firebase/firebase-admin"; 

// "auth" function: Retrieves user authentication data from Clerk.
import { auth } from "@clerk/nextjs/server";

// "redirect" function: Redirects unauthenticated users to the sign-in page.
import { redirect } from "next/navigation";


export async function createNewDocument() {
  /*
    this function creates a new document & handles
    1. Authentication
    2. Firestore Document Creation
    3. Nested user-specific metadata creation.
  */
  
  // "auth()" function retrieves authentication details about current user. If the user isn't authenticated, the returned SessionClaims will be empty or undefined.
  const { sessionClaims } = await auth();

  // if the user tries to "Create a New Document without Login/Sign-Up that is authenticate", the below code will throw the user to the CLERK Login screen!
  // check if user is authenticated by extracting the email, if not, redirect the user to the sign-in page
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
