import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from '@material-ui/core';
import firebase from 'firebase';
import Button from '@material-ui/core/Button';
import ArticleDisplay from './ArticleDisplay';
import './personalBoard.css';
import { Divider } from '@material-ui/core';


function PersonalBoard(props) {

    const { id } = useParams();
    const [board, updateBoard] = React.useState(null);
    const db = firebase.firestore();
    const userid = firebase.auth().currentUser.uid;
    let subscribedRef = useRef();   // to use instance variables in function
                                    // components.

    // similar to componentDidMount / update but for a function components
    // using functional component cause of useParams above (and React liked
    // functional components more)
    useEffect(() => {
        const boardRef = db.doc(`personalBoards/${userid}/pboards/${id}`);
        // return value is called during componentWillUnmount, which will
        // cause unsubscription from updates

        if(!subscribedRef.current)
        {
            subscribedRef.current = true;       // subscribed to firebase
            return boardRef.onSnapshot((boardDoc) => {
                if(!boardDoc.exists) {
                    alert("The board does not exist");
                    return;
                }
                updateBoard({ref: boardRef, ...boardDoc.data()});
            },
            (err) => alert(`error: ${String(err)}`)
            );
        }
    });

    const addToQueue = function(articleRef, front) {

        // get copy of queue refs in board
        const queueRefs = [...board.queue];

        if(front) {
            queueRefs.unshift(articleRef);
        }
        else {
            queueRefs.push(articleRef);
        }

        board.ref.update({queue: queueRefs});
    }

    return (
        board !== null ? 
            <div style={{display: 'flex', flexDirection: 'column', padding: "20px"}} >
                {
                    <h2>{board.boardName}</h2>
                }

                <h3>Articles ({board.articles.length})</h3>
                <div style={{display: 'flex', flexWrap: 'wrap'}}>
                    {   
                        board.articles.map(articleRef => <ArticleDisplay 
                            articleRef={articleRef}
                            addToQueue={addToQueue}
                            boardRef={board.ref} />)
                    }
                </div>
                <Divider />
                <h3>Queue ({board.queue.length})</h3>

                <div style={{display: 'flex', flexWrap: 'wrap'}}>
                    {
                        board.queue.map(articleRef => <ArticleDisplay 
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
