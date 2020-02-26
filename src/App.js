import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { FirebaseAuthProvider, FirebaseAuthConsumer } from '@react-firebase/auth';

import firebase from "firebase/app";
import 'firebase/auth';

import { makeStyles } from '@material-ui/core';


import Login from './Login';
import Home from './Home';
import config from './config'
import About from './About';
import PersonalBoards from './PersonalBoards';
import Sidebar from './Sidebar';

const drawerWidth = 240;  // width of the sidebar (can change to adjust)


const App = () => (
    <FirebaseAuthProvider firebase={firebase} {...config}>
        <FirebaseAuthConsumer> 
            {({ isSignedIn, user, providerId }) =>
            isSignedIn ?
            <BasePage>
                <Switch>
                    <Route path="/about">
                        <About />
                    </Route>
                    <Route path="/home">
                        <Home />
                    </Route>
                    <Route path="/boards">
                        <PersonalBoards />
                    </Route>
                    <Route path="">
                        <Home />
                    </Route>
                </Switch>
            </BasePage>
            :
            <Login />
        }
        </FirebaseAuthConsumer>
    </FirebaseAuthProvider>
);


// taken from material-ui drawers
const useStyles = makeStyles(theme => ({
    root: {
      display: 'flex',
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
    },
    drawerPaper: {
        width: drawerWidth,
    },
    content: {
      flexGrow: 1,
      padding: theme.spacing(2),
    },
    avatar: {
        backgroundColor: "#aaa",
        height: "6rem",
        width: "6rem",
    }
}));


/**
 * 
 * @param {*} props: props contains children to display actual app content 
 *  (non sidebar content)
 * 
 * This is the component which acts like a wrapper component to allow 
 *  a sidebar to exist
 */
function BasePage(props) {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <Sidebar classes={classes}/>
            <div className={classes.content}>
                {props.children}
            </div>
        </div>
    );
}

export default App;