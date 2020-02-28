import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from '@material-ui/core';
import firebase from 'firebase';
import Button from '@material-ui/core/Button';
import ArticleDisplay from './ArticleDisplay';

function PersonalBoard(props) {

    const { id } = useParams();
    const [state, setState] = React.useState({
        board: null,
        articles: [],
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
                const articlePromises = articleReferences.map(articleRef =>
                    articleRef.get().then((articleDoc) => {return {
                      id: articleDoc.id,
                      ...articleDoc.data()
                    }}
                ));

                Promise.all(articlePromises).then((articles) => {
                    setState(prevState => {
                        return {...prevState, articles: articles}
                    })
                    console.log(articles);
                });
                setState(prevState => {return {...prevState, board: board}});
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

    const handleDialogOpen = () => {
        setState(prevState => {return {...prevState, isDialogOpen: true}});
    }

    const handleDialogClose = () => {
        setState(prevState => {return {...prevState, isDialogOpen: false}});
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
                        <div style={{display: 'inline', float: 'left'}}>
                            <p>{article.name}</p>
                            <Button variant="contained" color="secondary"  onClick={handleDialogOpen}>
                                Preview
                            </Button>
                            <ArticleDisplay
                              isDialogOpen={state.isDialogOpen}
                              handleDialogClose={handleDialogClose}
                              url={article.url}
                              ArticleName={article.name}
                              id={article.id}/>
                        </div>
                    );
                })
            }
        </div>

    )
}


export default PersonalBoard;
