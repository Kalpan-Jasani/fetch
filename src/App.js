import React from 'react';
import Login from './Login';
import Home from './Home';
import config from './config'
import firebase from "firebase/app";
import { FirebaseAuthProvider, FirebaseAuthConsumer } from '@react-firebase/auth';
import PersonalBoards from './PersonalBoards'
require('firebase/auth')

firebase.initializeApp(config);

function App() {
  return (
    <FirebaseAuthProvider firebase={firebase} {...config}>
      <FirebaseAuthConsumer>
        {({ isSignedIn, user, providerId }) => {
          if (isSignedIn) {
            return (
              <Home />
            );
          } else {
            return (
              <Login />
            )
          }
        }}
      </FirebaseAuthConsumer>
    </FirebaseAuthProvider>
  );
}

export default App;
