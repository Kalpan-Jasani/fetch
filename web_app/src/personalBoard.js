import React, { useEffect, useRef } from 'react';
import { useParams, Link, useHistory } from 'react-router-dom';
import { CircularProgress } from '@material-ui/core';
import firebase from 'firebase';
import Button from '@material-ui/core/Button';
import ArticleDisplay from './ArticleDisplay';
import './personalBoard.css';
import { Divider } from '@material-ui/core';

/**
 * 
 * @param {*} props: none used
 * 
 * This component must be rendered at a url (hash based url) that 
 * is domain.com/#/boards/<id>/ or domain.com/#/boards/<ownerid>/<id>
 */
function PersonalBoard(props) {

    const { ownerid, id } = useParams();    // get params based on url
    const history = useHistory();   // history of browsing (already maintained)
    const [state, setState] = React.useState({
        board: null,
        followers: [],
        saving: false,
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

    /* similar to componentDidMount / update but for a function components
    using functional component cause of useParams above (and React liked
    functional components more) */
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
                        followers: boardDoc.data().followers,
                    }    
                });
            },
                (err) => alert(`error: ${String(err)}`)
            );

            return () => {
                unsubscribe();  // unsubscribe from Firebase
                subscribedRef.current = false;  // unsubscribed is marked
            }
        }
    });

    /**
     * set this board as updated by updating its time stamp on firebase,
     * when it renders. This update on the database will be called everytime
     * this component is mounted and everytime it updates (because of state 
     * change etc)
     */
    
    useEffect(() => {
        boardRef.update({lastSeenTime: new Date()});
    })

    const addToQueue = function(articleRef, front) {

        // get copy of queue refs in board
        const queueRefs = [...state.board.queue];

        if(front) {
            queueRefs.unshift(articleRef)
        }
        else {
            queueRefs.push(articleRef);
        }
       
        setState(prevState => {return {...prevState, queue: queueRefs}});
        state.board.ref.update({queue: queueRefs});

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

    return (
        state.board !== null ? 
            <div style={{display: 'flex', flexDirection: 'column', padding: "20px"}} >
                {
                    <h2>{state.board.boardName}</h2>
                }

                {/* follow related */}
                <Link to={`/pboards/followers/${userid}/${id}`}>
                    <h3>{`Followers: ${state.followers.length}`}</h3>
                </Link>
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
                <div style={{display: 'flex', flexWrap: 'wrap'}}>
                    {   
                        state.board.articles.map(articleRef => <ArticleDisplay 
                            articleRef={articleRef}
                            addToQueue={addToQueue}
                            boardRef={state.board.ref} />)
                    }
                </div>
                <Divider />

                {/* display of queue */}
                <h3>Queue ({state.board.queue.length})</h3>

                <div style={{display: 'flex', flexWrap: 'wrap'}}>
                    {
                        state.board.queue.map(articleRef => <ArticleDisplay 
                            key={articleRef.id}
                            articleRef={articleRef} />)
                    }
                </div>
            </div>
            :
            <p>Loading</p>
    )
}


export default PersonalBoard;
