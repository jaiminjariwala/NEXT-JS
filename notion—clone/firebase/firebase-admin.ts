// Server-Side Firebase Admin
/* 
    The following scripts sets up Firebase Admin in a Node.js environment.
    
    What is Firestore?
    => Firestore is a NoSQL cloud database that allows us to store, sync and query data for web and mobile apps in real time.
    => Using Admin SDK, it gives elevated privileges compared to the client SDK.

    What is "Firebase Admin SDK"?
    => A server-side library provided by Firebase that allows developers to interact with Firebase services. It is designed for backend environments like Node.js and is used for tasks such as "Managing Authentication(creating/deleting users)", "Accessing Firestore without client-side restrictions", "Sending push notifications" and "Accessing Firebase Analytics data".

    About Imports:
    1. initializeApp: Initializes a "Firebase Admin" application instance. If no app exists, it creates one using the credentials we provide.

    2. getApps: It retrieves a list of currently initialized firebase apps. If it returns an empty array, it means no app has been initialized yet

    3. App: Represents a "Firebase Admin" app instance.

    4. getApp: Retrieves the default "Firebase Admin" app instance, if one already exists. If no app is initialized, it will throw an error unless you provide an app name explicitly.

    5. cert: A method used to provide credentials for authenticating the "Firebase Admin SDK". This expects a "Service Account Key (typically a JSON File)".

    6. getFirestore: Retrieves the Firestore instance associated with the initialized Firebase Admin app, allowing us to interact with Firestore.
*/

import { initializeApp, getApps, App, getApp, cert, ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// The file contains credentials required to authenticate with Firebase Services
// Create a fully typed ServiceAccount object
const serviceKey: ServiceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
}

// Firebase app initialization
let app: App
if (getApps().length === 0) {
    app = initializeApp({
        credential: cert(serviceKey)
    })
} else {
    app = getApp()
}

const adminDb = getFirestore(app);
export { app as adminApp, adminDb };
