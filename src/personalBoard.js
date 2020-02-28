import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from '@material-ui/core';
import firebase from 'firebase';
import Button from '@material-ui/core/Button';
import ArticleDisplay from './ArticleDisplay';
import './personalBoard.css';


function PersonalBoard(props) {

    const { id } = useParams();
    const [state, setState] = React.useState({
        board: null,
        articles: [],
        queue: [],
        isDialogOpen: false,
    });
    const db = firebase.firestore();
    const userid = firebase.auth().currentUser.uid;

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

                setState(prevState => {return {...prevState, board: board}});
            }).
            catch((err) =>console.log(err));
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

    return (
        <div>
            {
                state.board &&
                <h2>{state.board.boardName}</h2>
            }

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

    )
}


export default PersonalBoard;
