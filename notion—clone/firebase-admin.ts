/* 
    1. initializeApp: Initializes a "Firebase Admin" application instance. If no app exists, it creates one using the credentials we provide.

    2. getApps: It retrieves a list of currently initialized firebase apps. If it returns an empty array, it means no app has been initialized yet

    3. App: Represents a "Firebase Admin" app instance.

    4. getApp: Retrieves the default "Firebase Admin" app instance, if one already exists. If no app is initialized, it will throw an error unless you provide an app name explicitly.

    5. cert: A method used to provide credentials for authenticating the "Firebase Admin SDK". This expects a "Service Account Key (typically a JSON File)".

    6. getFirestore: Retrieves the Firestore instance associated with the initialized Firebase Admin app, allowing us to interact with Firestore.

*/

import {
    initializeApp,
    getApps,
    App,
    getApp,
    cert,
} from "firebase-admin/app"

import { getFirestore } from "firebase-admin/firestore"



// below code imports the "Service Account JSON File". The file contains credentials required to authenticate with Firebase Services
const serviceKey = require("@service_key.json")



// Firebase app initialization
let app: App

if (getApps().length === 0) {
    app = initializeApp({
        credential: cert(serviceKey)
    })
} else {
    app = getApp()
}

const adminDb = getFirestore(app)   

export {app as adminApp, adminDb}