import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import firebase from 'firebase';

function PersonalBoard(props) {

    const { id } = useParams();
    const [state, setState] = React.useState({
        board: null,
        articles: [],
    });
    const db = firebase.firestore();
    const userid = firebase.auth().currentUser.uid;

    // similar to componentDidMount / update but for a function components
    // using functional component cause of useParams above (and React liked
    // functional components more)
    useEffect(() => {
        console.log("flag 1");
        if(state.board === null) {
            const boardRef = db.doc(`personalBoards/${userid}/pboards/${id}`);
            boardRef.get().then((boardDoc) => {
                if(!boardDoc.exists) {
                    console.log("The board does not exist");
                    return;
                }

                const board = boardDoc.data();
                // const articleReferences = board.articles;
                // const articlePromises = articleReferences.map(articleRef =>
                //     articleRef.get().then((articleDoc) => articleDoc.data())
                // );

                // Promise.all(articlePromises).then(
                //     (articles) => setState({articles: articles}));
                setState({board: board});
            }).
            catch((err) =>console.log(err));
        }
    });

    const componentDidMount = () => {
        // setup listener for the details of the board
        // also obtain the references of all the articles
            // loop through the article references and fetch the articles
            // store these in the state as articles, by calling setState

    };

    return (
        <div>
            {
                state.board &&
                <h2>{state.board.boardName}</h2>
            }

            {/* print names of the articles */}
            <p>{id}</p>
        </div>

    )
}


export default PersonalBoard;