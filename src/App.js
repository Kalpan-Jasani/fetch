import React from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import { FirebaseAuthProvider, FirebaseAuthConsumer } from '@react-firebase/auth';

import firebase from "firebase/app";
import 'firebase/auth';

import Login from './Login';
import Home from './Home';
import config from './config'
import About from './About';


class App extends React.Component {
    render() {
        return (
            <FirebaseAuthProvider firebase={firebase} {...config}>
                <FirebaseAuthConsumer>
                    {({ isSignedIn, user, providerId }) =>
                        isSignedIn ?
                        <HashRouter>
                            <Switch>
                                <Route path="/about">
                                    <About />
                                </Route>
                                <Route path="/home">
                                    <Home />
                                </Route>
                                <Route path="/boards">
                                    <Home />
                                </Route>
                                <Route path="">
                                    <Home />
                                </Route>
                            </Switch>
                        </HashRouter>
                        :
                        <Login />
                    }
                </FirebaseAuthConsumer>
            </FirebaseAuthProvider>
        );
    }
}

export default App;