import React from 'react';

import firebaseConfig from './config';

import firebase from "firebase/app";
import "firebase/auth";
import { FirebaseAuthProvider, FirebaseAuthConsumer } from '@react-firebase/auth';

import './App.css';

function App() {
    return (
        <div className="App">
            <FirebaseAuthProvider firebase={firebase} {...firebaseConfig}>
                <FirebaseAuthConsumer>
                    {({ isSignedIn, user, providerId }) =>
                    isSignedIn ?
                    <p>Hello {firebase.auth().currentUser.displayName} </p>
                    :
                    <Login/>
                    }
                </FirebaseAuthConsumer>
            </FirebaseAuthProvider>
            <Logout/>
        </div>
    );
}

const handleGoogleSignIn = async (event) => {
    var googleProvider = new firebase.auth.GoogleAuthProvider();
    var result = await firebase.auth().signInWithPopup(googleProvider).catch((error) => {
        console.error(error.code);
    });

    console.log("flag 1");
    console.log(result);
    console.log("new? " + String(result.additionalUserInfo.isNewUser));
    if (result === undefined) {
        return;
    }
}

function Login() {
    return (
        <button onClick={handleGoogleSignIn}>Sign in with Google (for now)</button>
    )
}

function Logout() {
    return (
        <button onClick={() => firebase.auth().signOut()}>Logout</button>
    );
}
export default App;
