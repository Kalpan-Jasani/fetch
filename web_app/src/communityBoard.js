import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from '@material-ui/core';
import firebase from 'firebase';
import Button from '@material-ui/core/Button';
import ArticleDisplay from './CommunityArticleDisplay';
import './personalBoard.css';
import { Divider } from '@material-ui/core';

function CommunityBoard(props) {
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
        const boardRef = db.doc(`communityBoards/${id}`);
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
    
    return (
        board !== null ? 
            <div style={{display: 'flex', flexDirection: 'column', padding: "20px"}} >
                {
                    <h2>{board.name}</h2>
                }
                <h3>Articles ({board.articles.length})</h3>
                <div style={{display: 'flex', flexWrap: 'wrap'}}>
                    {   
                        board.articles.map(articleRef => <ArticleDisplay 
                            articleRef={articleRef}
                            key={articleRef.id} />)
                    }
                </div>
            </div>
            :
            <p>Loading</p>
    )
}
export default CommunityBoard;