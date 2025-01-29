import { initializeApp } from "firebase/app";
import {
	getAuth,
	GoogleAuthProvider,
	FacebookAuthProvider,
	signInWithPopup,
} from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA5VbR3iHW_UQFmjgndn2FCuwLeq5_swiM",
  authDomain: "mesaggio-599dd.firebaseapp.com",
  projectId: "mesaggio-599dd",
  storageBucket: "mesaggio-599dd.firebasestorage.app",
  messagingSenderId: "567816760008",
  appId: "1:567816760008:web:baa5825cc6417c9ddc53fd"
};

// Initialize Firebase
initializeApp(firebaseConfig);

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

const auth = getAuth();

export const authWithGoogle = async () => {
	let user = null;
	await signInWithPopup(auth, googleProvider)
		.then((res) => {
			user = res.user;
		})
		.catch((err) => console.log(err));
	return user;
};

export const authWithFacebook = async () => {
	let user = null;
	await signInWithPopup(auth, facebookProvider)
		.then((res) => {

			// This gives you a Facebook Access Token. You can use it to access the Facebook API.
			const credential = FacebookAuthProvider.credentialFromResult(res);
			res.user.facebookAccessToken = credential.accessToken;

			user = res.user;
		})
		.catch((err) => console.log(err));
	return user;
};
