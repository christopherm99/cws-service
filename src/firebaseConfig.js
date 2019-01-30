import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import config from "./firebase.json";

firebase.initializeApp(config);

var db = firebase.firestore();
var auth = firebase.auth();

export { db, auth };
