/* global chrome */
// above line is ES Lint syntax, basically declares that this variable would be
// present when the code runs, so is not an error
import React, { useState, useEffect } from 'react';

import firebaseConfig from './config';

import firebase from "firebase/app";
import "firebase/auth";

import './App.css';
import ArticleForm from './ArticleForm';


firebase.initializeApp(firebaseConfig);

function App() {
    const [signedIn, updateSignInState] = useState(false);

    useEffect(() => {   // listen for changes in sign in state. TODO: also use localStorage for fast response
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
    });

    return (
        <div className="App">
            {
                signedIn ?
                <ArticleForm />
                :
                <p>You are not signed in, acceess options page to sign in</p>
            }
            <div>
                <a target="_blank" href={`chrome-extension://odmffghdonlgbjgdoffnaebfpheamcok/options/index.html`}>Options</a>
            </div>
        </div>
    );
}

export default App;
