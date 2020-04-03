import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CircularProgress } from '@material-ui/core';
import firebase from 'firebase';
import Button from '@material-ui/core/Button';
import ArticleDisplay from './ArticleDisplay';
import './personalBoard.css';
import { Divider } from '@material-ui/core';


function PersonalBoard(props) {

    const { ownerid, id } = useParams();
    const [state, setState] = React.useState({
        board: null,
        followers: [],
        articles: [],
        queue: [],
        isDialogOpen: false,
        saving: false,
    });
    const db = firebase.firestore();
    const userid = ownerid ?? firebase.auth().currentUser.uid;
    const currID = firebase.auth().currentUser.uid;

    // similar to componentDidMount / update but for a function components
    // using functional component cause of useParams above (and React liked
    // functional components more)
    useEffect(() => {
        if(state.board === null) {
            const boardRef = db.doc(`personalBoards/${userid}/pboards/${id}`);
            boardRef.get().then((boardDoc) => {
                if(!boardDoc.exists) {
                    console.log("The board does not exist");
                    return;
                }

                const board = boardDoc.data();
                const articleReferences = board.articles;
                const queueIds = board.queue.map(articleRef => articleRef.id);
                const articlePromises = articleReferences.map(articleRef =>
                    articleRef.get().then((articleDoc) => {return {
                      ref: articleRef,
                      id: articleDoc.id,
                      ...articleDoc.data()
                    }}
                ));
                
                Promise.all(articlePromises).then((articles) => {
                    const queue = [];
                    queueIds.forEach((articleId) => {
                        const article = articles.find(article => article.id == articleId);
                        queue.push(article);
                    })

                    setState(prevState => {
                        return {...prevState, articles: articles, queue: queue}
                    })
                });

                setState(prevState => {return {...prevState, board: board, followers: board.followers}});
            }).catch((err) =>console.log(err));
        }
    });

    const handleRefreshBoard = () => {
        setState(prevState => {return {...prevState, board: null, articles: []}});
    }

    const addToQueue = function(articleRef, front) {

        const article = state.articles.find((article) => article.id == articleRef.id);
        const userid = firebase.auth().currentUser.uid;

        // get copies of queue and references in queue
        const queueRefs = [...state.board.queue];
        const queue = [...state.queue];
    
        const boardRef = firebase.firestore()
            .collection("personalBoards")
            .doc(userid)
            .collection("pboards").doc(id);

        // update things
        queueRefs.push(articleRef);
        queue.push(article);
        boardRef.update({queue: queueRefs}).then(setState(prevState => {return {...prevState, board: null}}));
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
        <div style={{display: 'flex', flexDirection: 'column', padding: "20px"}} >
            {
                state.board &&
                <h2>{state.board.boardName}</h2>
            }
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

            <h3>Articles ({state.articles.length})</h3>
            <div style={{display: 'flex', flexWrap: 'wrap'}}>
                {
                    
                    state.articles.map((article) => {
                        return (
                            <div className={article.read ? "article-read": "article-unread"} style={{display: 'inline', float: 'left'}}>
                                <p>{article.name}</p>
                                
                                <ArticleDisplay 
                                // isDialogOpen={state.isDialogOpen} 
                                // handleDialogClose={handleDialogClose} 
                                url={article.url} 
                                ArticleName={article.name}
                                articleId={article.id}
                                articleRef={article.ref}
                                boardId={id}
                                addToQueue={addToQueue}
                                refreshBoard={handleRefreshBoard}
                                readStatus={article.read}
                                />
                            </div>
                        );
                    })
                }
            </div>
            <Divider />
            <h3>Queue ({state.queue.length})</h3>

            <div style={{display: 'flex', flexWrap: 'wrap'}}>
                {
                    state.queue.map((article) => {
                        return (
                            <div className={article.read ? "article-read": "article-unread"} style={{display: 'inline', float: 'left'}}>
                                <p>{article.name}</p>
                                
                                <ArticleDisplay 
                                // isDialogOpen={state.isDialogOpen} 
                                // handleDialogClose={handleDialogClose} 
                                url={article.url} 
                                ArticleName={article.name}
                                articleId={article.id}
                                articleRef={article.ref}
                                boardId={id}
                                addToQueue={addToQueue}
                                refreshBoard={handleRefreshBoard}
                                readStatus={article.read}
                                />
                            </div>
                        );
                    })
                }
            </div>
        </div>

    )
}


export default PersonalBoard;
