import React, { useState, useEffect } from 'react';

import firebase from "firebase/app";
import 'firebase/auth';

import {Button} from "@material-ui/core";

import './App.css';
import firebaseConfig from './config';
import Login from './Login';

firebase.initializeApp(firebaseConfig);

function App() {
    const [signedIn, setSignIn] = useState(false);

    useEffect(() => {
        firebase.auth().onAuthStateChanged((user) => {
            console.log('flag 1');
            console.log(user);
            setSignIn(user ? true : false);
        }, 
            (err) => alert("Login error: " + String(err))
        );
    })

    return (
        signedIn ?
            <div className="App">
                <p>Signed in as {firebase.auth().currentUser.displayName } </p>
                <Button onClick={() => firebase.auth().signOut()}>Sign out</Button>
            </div>
            :
            <Login className="App"/>
    );
}

export default App;
