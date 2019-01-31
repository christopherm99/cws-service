import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import config from "./firebase.json";

const app = firebase.initializeApp(config);

const db = firebase.firestore();
const auth = firebase.auth();

export { db, auth, app };
