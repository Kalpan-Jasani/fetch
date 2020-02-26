import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import storage from 'local-storage-fallback';
import Login from './Login';
import Home from './Home';
import config from './config'
import firebase from "firebase/app";
import { FirebaseAuthProvider, FirebaseAuthConsumer } from '@react-firebase/auth';
import PersonalBoards from './PersonalBoards'
import {
  ThemeProvider,
  createGlobalStyle
} from 'styled-components';
import useTheme from './useTheme';
import ToggleMode from './ToggleMode';
import style from 'styled-theming';
require('firebase/auth')


firebase.initializeApp(config);

const getBackground = style('mode', {
  light: '#EEE',
  dark: '#111'
});

const getForeground = style('mode', {
  light: '#111',
  dark: '#EEE'
});

const GlobalStyle = createGlobalStyle`
body {
  background-color: ${getBackground};
  color: ${getForeground};
}
`;

function App() {
  const theme = useTheme();
  return (
    <ThemeProvider theme={theme}>
    <>
    <div>
    <GlobalStyle />
    <ToggleMode />
    <FirebaseAuthProvider firebase={firebase} {...config}>
      <FirebaseAuthConsumer>
        {({ isSignedIn, user, providerId }) => {
          if (isSignedIn) {
            return (
              <PersonalBoards />
            );
          } else {
            return (
              <Login />
            )
          }
        }}
      </FirebaseAuthConsumer>
    </FirebaseAuthProvider>
    </div>
    </>
    </ThemeProvider>
  );
}

export default App;
