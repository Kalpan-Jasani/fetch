import React from 'react';
import { HashRouter, Route, Switch, Redirect } from 'react-router-dom';
import { FirebaseAuthProvider, FirebaseAuthConsumer } from '@react-firebase/auth';

import firebase from "firebase/app";
import 'firebase/auth'; // initialize
import 'firebase/firestore';  // initialize

import { makeStyles } from '@material-ui/core';
import {
  ThemeProvider,
  createGlobalStyle
} from 'styled-components';
import style from 'styled-theming';

import Register from './Register';
import Login from './Login';
import ArticleForm from './ArticleForm';
import Home from './Home';
import config from './config'
import About from './About';
import PersonalBoards from './PersonalBoards';
import Sidebar from './Sidebar';
import useTheme from './useTheme';
import ToggleMode from './ToggleMode';
import Profile from './Profile';
import PersonalBoard from './personalBoard';
import Users from './Users';

const drawerWidth = 240;  // width of the sidebar (can change to adjust)

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
            <GlobalStyle />
            <ToggleMode />
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
                            <Route path="/boards/:id">
                                <PersonalBoard />
                            </Route>
                            <Route path="/boards">
                                <PersonalBoards />
                            </Route>
                            <Route path="/login">
                                <Redirect to="/home"/>
                            </Route>
                            <Route path="/profile">
                                <Profile />
                            </Route>
                            <Route path="/users">
                                <Users />
                            </Route>
                            <Route>
                                <Home />
                            </Route>
                        </Switch>
                    </BasePage>
                    :
                    <Switch>
                        <Route path="/register">
                            <Register />
                        </Route>
                        <Route path="">
                            <Login />
                        </Route>
                    </Switch>
                    }
                </FirebaseAuthConsumer>
            </FirebaseAuthProvider>
        </ThemeProvider>
    )

}



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
    const [isDialogOpen, setOpenDialog] = React.useState(false);
    const handleCloseDialog = () => setOpenDialog(false);
    return (
        <div className={classes.root}>
            <ArticleForm open={isDialogOpen} onClose={handleCloseDialog}/>
            <Sidebar openForm = {setOpenDialog} user={props.user} classes={classes}/>
            <div className={classes.content}>
                {props.children}
            </div>
        </div>
    );
}

export default App;