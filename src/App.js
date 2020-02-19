import React from 'react';
import Login from './Login';
import Register from './Register'
import Home from './Home';
import config from './config'
import firebase from "firebase/app";
import { FirebaseAuthProvider, FirebaseAuthConsumer } from '@react-firebase/auth';
require('firebase/auth')

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
