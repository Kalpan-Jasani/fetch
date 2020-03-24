import React, { useState } from 'react';

import firebaseConfig from './config';

import firebase from "firebase/app";
import "firebase/auth";

import './App.css';
import ArticleForm from './ArticleForm';


firebase.initializeApp(firebaseConfig);

function App() {
    const [signedIn, updateSignInState] = useState(false);

    firebase.auth().onAuthStateChanged(
        (user) => {
            if(user) {
                updateSignInState(true);
                console.log("user logged in");
            }
            else {
                updateSignInState(false);
            }
        },(e) => {
            console.log("error in firebase authorization");
            updateSignInState(false);
            console.log(e);
        }
    );

    return (
        <div className="App">
            {
                signedIn ?
                <ArticleForm />
                :
                <Login/>
            }
            <br/> {/* new line */}
            <button onClick={() => firebase.auth().signOut()}>Logout</button>
        </div>
    );
}

const handleGoogleSignIn = (event) => {
    var googleProvider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(googleProvider).catch((error) => {
        console.error(error.code);
    });
}

function Login() {
    return (
        <button onClick={handleGoogleSignIn}>Sign in with Google (for now)</button>
    )
}

export default App;
