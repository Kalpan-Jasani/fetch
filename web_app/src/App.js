import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
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
import CommunityArticleForm from './CommunityArticleForm';
import Home from './Home';
import config from './config'
import About from './About';
import PersonalBoards from './PersonalBoards';
import CommunityBoards from './CommunityBoards';
import CommunityBoard from './communityBoard';
import FollowDisplay from './FollowDisplay';
import Sidebar from './Sidebar';
import useTheme from './useTheme';
import Profile from './Profile';
import PersonalBoardList from './PersonalBoardList';
import PersonalBoardFollowers from './PersonalBoardFollowers';
import PersonalBoardFollowList from './PersonalBoardFollowList';
import PersonalBoard from './personalBoard';
import StarredItems from './StarredItems';
import Users from './Users';
import ArticlesRaisedEyebrowDisplay from './ArticlesRaisedEyebrowDisplay'

import './App.css';
import ToggleMode from './ToggleMode';

const drawerWidth = 255;  // width of the sidebar (can change to adjust)

const getBackground = style('mode', {
  light: 'transparent',
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
                            <Route path="/boards/:ownerid/:id">
                                <PersonalBoard />
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
                            <Route path="/profile/:id">
                                <Profile />
                            </Route>
                            <Route path="/pboards/list/:id">
                                <PersonalBoardList />
                            </Route>
                            <Route path="/pboards/followlist/:id">
                                <PersonalBoardFollowList />
                            </Route>
                            <Route path="/pboards/followers/:ownerid/:id">
                                <PersonalBoardFollowers />
                            </Route>
                            <Route path="/users">
                                <Users />
                            </Route>
                            <Route path="/followers/:id">
                                <FollowDisplay />
                            </Route>
                            <Route path="/following/:id">
                                <FollowDisplay />
                            </Route>
                            <Route path="/community-boards/:id">
                                <CommunityBoard />
                            </Route>
                            <Route path="/community-boards">
                                <CommunityBoards />
                            </Route>
                            <Route path="/articles-raised-eyebrow">
                                <ArticlesRaisedEyebrowDisplay />
                            </Route>
                            <Route path="/starred">
                                <StarredItems/>
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
    const [isDialogOpen2, setOpenDialog2] = React.useState(false);
    const handleCloseDialog = () => setOpenDialog(false);
    const handleCloseDialog2 = () => setOpenDialog2(false);
    return (
        <div className={classes.root}>
            <ArticleForm open={isDialogOpen} onClose={handleCloseDialog}/>
            <CommunityArticleForm open={isDialogOpen2} onClose={handleCloseDialog2}/>
            <Sidebar openForm1={setOpenDialog} openForm2={setOpenDialog2} user={props.user} classes={classes}/>

            <div className={classes.content}>
                {props.children}
            </div>
            <ToggleMode className="theme-toggle"/>
        </div>
    );
}

export default App;
