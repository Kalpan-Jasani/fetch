import React, { useEffect, useRef } from 'react';
import { useParams, Link, useHistory } from 'react-router-dom';
import { CircularProgress } from '@material-ui/core';
import firebase from 'firebase';
import Button from '@material-ui/core/Button';
import ArticleDisplay from './ArticleDisplay';
import './personalBoard.css';
import { Divider } from '@material-ui/core';
import PlayQueue from './PlayQueue';
import { green } from '@material-ui/core/colors';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import { withRouter } from "react-router";
// import { createMuiTheme, useStyles, makeStyles, ThemeProvider } from '@material-ui/core/styles';
// import {useStyles}
/**
 * 
 * @param {*} props: none used
 * 
 * This component must be rendered at a url (hash based url) that 
 * is domain.com/#/boards/<id>/ or domain.com/#/boards/<ownerid>/<id>
 */

//   const theme = createMuiTheme({
//     palette: {
//       primary: green,
//     },
//   });

function PersonalBoard(props) {

    const { ownerid, id } = useParams();    // get params based on url
    const { match, location } = props;
    const history = useHistory();   // history of browsing (already maintained)
      var isOpen;
        if(props.history.location.state != undefined) {
          isOpen = props.history.location.state.open;
        } else {
          isOpen = false;
        }
    const [state, setState] = React.useState({
        board: null,
        followers: [],
        saving: false,
        open: isOpen,
    });
    
    /* 
     * this makes a non-state but kind of static variable that exists the next
     * time this functional component is re-rendered
     * 
     * This is needed because firebase is only subscribed to the board
     * once
     * 
     * Its initial value is false
     */
    const subscribedRef = useRef(false);

    /**
     * get current value, which can be different from false
     */
    let subscribed = subscribedRef.current;
    
    const db = firebase.firestore();
    
    /**
     * userid: the id of the owner of the board. If there is no ownerid present
     *  in the url, then the current user is selected as the owner
     * currId: the id of the logged in user
     */
    const userid = ownerid ?? firebase.auth().currentUser.uid;
    const currID = firebase.auth().currentUser.uid;
    const boardRef = db.doc(`personalBoards/${userid}/pboards/${id}`);

    /* 
    * similar to componentDidMount / update but for a function components
    * using functional component cause of useParams above (and React liked
    * functional components more)
    * 
    * Subscribe to updates from firebase for this board
    */
    useEffect(() => {
        if(!subscribed)
        {
            subscribedRef.current = true;       // mark subscribed to firebase
            const unsubscribe = boardRef.onSnapshot((boardDoc) => {
                if(!boardDoc.exists) {
                    alert("The board does not exist");
                    history.goBack();
                    return;
                }
                setState(prevState => { return {
                        ...prevState,
                        board: {ref: boardRef, ...boardDoc.data()},
                        followers: boardDoc.data().followers || [],
                    }
                });
            }, err => alert(`error: ${err}`));

            /* function that is called when cleaning up (this effect) */
            return () => {
                unsubscribe();  // unsubscribe from Firebase
                subscribedRef.current = false;  // unsubscribed is marked
            }
        }
    }, [subscribedRef.current]);

    /**
     * set this board as updated by updating its time stamp on firebase,
     * when it renders. This update on the database will be called everytime
     * this component is mounted and everytime it updates (because of state 
     * change etc)
     */
    
    useEffect(() => {
        boardRef.update({lastSeenTime: new Date()});
    }, []);     // [] leads to this effect only running once like 
                // componentDidMount

    const addToQueue = function(articleRef, front) {

        // get copy of queue refs in board
        const queueRefs = [...state.board.queue];

        if(front) {
            queueRefs.unshift(articleRef);
        }
        else {
            queueRefs.push(articleRef);
        }

        state.board.ref.update({queue: queueRefs});
    }

    const deleteFromQueue = function(articleRef) {

        console.log("Pressed")
        var queue = [];
        const queueRefs = [...state.board.queue];
        for(var i=0; i< queueRefs.length; i++) {
            if(queueRefs[i].id == articleRef.id) {
               // do nothing
            } else {
            queue.push(queueRefs[i])
            }
        };
        setState(prevState => {return {...prevState, queue: queue}});
        state.board.ref.update({queue: queue});

    }

    const followBoard = async () => {
        if (ownerid !== undefined) {
            setState(prevState => {return {...prevState, saving: true}});
            var path = firebase.firestore()
            .collection("personalBoards")
            .doc(ownerid)
            .collection("pboards")
            .doc(id);

            var userPath = firebase.firestore().collection("users").doc(currID);

            var updatedFollowers;
            await firebase.firestore().runTransaction((transaction) => {
                return transaction.get(path).then((doc) => {
                    var fields = doc.data();
                    var followers = fields.followers ?? [];
                    followers.push(currID);

                    updatedFollowers = followers;

                    transaction.update(path, {followers: followers});
                })
            });

            await firebase.firestore().runTransaction((followTransaction) => {
                return followTransaction.get(userPath).then((doc) => {
                    var fields = doc.data();
                    var pboardFollowing = fields.pboardFollowing ?? [];
                    pboardFollowing.push(id);
                    console.log(pboardFollowing);

                    followTransaction.update(userPath, {pboardFollowing: pboardFollowing});
                })
            });

            setState(prevState => {return {...prevState, followers: updatedFollowers, saving: false}});
        }
    }

    const unfollowBoard = async () => {
        if (ownerid !== undefined) {
            setState(prevState => {return {...prevState, saving: true}});
            var path = firebase.firestore()
            .collection("personalBoards")
            .doc(ownerid)
            .collection("pboards")
            .doc(id);
            
            var userPath = firebase.firestore().collection("users").doc(currID);

            var updatedFollowers;
            await firebase.firestore().runTransaction((transaction) => {
                return transaction.get(path).then((doc) => {
                    var fields = doc.data();
                    var followers = fields.followers ?? [];
                    var index = followers.indexOf(currID);
                    if (index > -1) {
                        followers.splice(index, 1);
                    } else {
                        console.log("user is not a follower!");
                    }

                    updatedFollowers = followers;

                    transaction.update(path, {followers: followers});
                });
            });

            await firebase.firestore().runTransaction((followTransaction) => {
                return followTransaction.get(userPath).then((doc) => {
                    var fields = doc.data();
                    var pboardFollowing = fields.pboardFollowing ?? [];
                    var index = pboardFollowing.indexOf(id);
                    if (index > -1) {
                        pboardFollowing.splice(index, 1);
                    } else {
                        console.log("user is not a follower!");
                    }

                    followTransaction.update(userPath, {pboardFollowing: pboardFollowing});
                })
            });

            setState(prevState => {return {...prevState, followers: updatedFollowers, saving: false}});
        }
    }

    const play = () => {
        setState(prevState => {return {...prevState, open: true}});
       //console.log(state.open)
    }

    const stop = () => {
        setState(prevState => {return {...prevState, open: false}});
    }

    return (
        state.board !== null ? 
            <div style={{display: 'flex', flexDirection: 'column', padding: "20px"}} >
                <AppBar color="inherit" position="static">
                    <Toolbar variant="dense">
                        
                        { <h1 style={{marginRight:'40px', flexGrow: '1', fontFamily: 'Arial'}}>{state.board.boardName}</h1> }
                        <Button 
                            variant="contained" 
                            style={{backgroundColor: '#4CAF50', width:'100px', padding: '5px 5px 5px 4px',marginRight: '20px'}} 
                            onClick={play}
                            startIcon={<PlayArrowIcon />}>
                            Play  
                        </Button>
                        {/* follow related */}
                        <Link style={{marginRight:'20px'}} to={`/pboards/followers/${userid}/${id}`}>
                            <h3>{`Followers: ${state.followers.length}`}</h3>
                        </Link>

                    </Toolbar>
                </AppBar>
                {/* Playlist modal */}
                { state.open ? (
                        <div>
                         <PlayQueue 
                            queue={state.board.queue}
                            stop={stop}
                            open={state.open}
                            size={state.board.queue.length}
                            remove={deleteFromQueue}
                         />
                        </div>
                     ): null }

                <div style={{height: 15}}/>
                <div style={{ position: 'relative', width: 100 }}>
                {ownerid && ownerid !== currID ?
                    (state.followers ?? []).includes(currID) 
                        ? <Button onClick={() => unfollowBoard()} color="secondary" variant="outlined" style={{width: 100}} disabled={state.saving}>
                            Unfollow
                        </Button>
                        : <Button onClick={() => followBoard()} color="primary" variant="outlined" style={{width: 100}} disabled={state.saving}>
                            Follow
                        </Button>
                : null}
                {state.saving && <CircularProgress size={24} style={{ position: 'absolute', top: '50%', left: '50%', marginTop: -12, marginLeft: -12 }} />}
                </div>
                <div style={{height: 25}} />

                {/* main dispaly of articles */}
                <h3>Articles ({state.board.articles.length})</h3>
                <div className="articlesContainer">
                    {   
                        state.board.articles.map(articleRef => 
                            <div className="articlesContainer__articleWrapper"
                              key={articleRef.id} 
                            >
                                <ArticleDisplay 
                                    articleRef={articleRef}
                                    addToQueue={addToQueue}
                                    boardRef={state.board.ref}
                                />
                            </div>
                        )
                    }
                </div>
                <Divider />

                {/* display of queue */}
                <h3>Queue ({state.board.queue.length})</h3>

                <div className="articlesContainer">
                    {
                        state.board.queue.map(articleRef => 
                            <div className="articlesContainer__articleWrapper"
                              key={articleRef.id} 
                            >
                                <ArticleDisplay 
                                    key={articleRef.id}
                                    articleRef={articleRef} 
                                />
                            </div>
                        )
                    }
                </div>
            </div>
            :
            <p>Loading</p>
    )
}


export default withRouter (PersonalBoard);
