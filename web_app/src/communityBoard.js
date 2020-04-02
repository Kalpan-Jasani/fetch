import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from '@material-ui/core';
import firebase from 'firebase';
import Button from '@material-ui/core/Button';
import CommunityArticleDisplay from './CommunityArticleDisplay';
import './personalBoard.css';
import { Divider, Select, MenuItem, InputLabel } from '@material-ui/core';


function CommunityBoard(props) {

    const { id } = useParams();
    const [state, setState] = React.useState({
        board: null,
        articles: [],
        isDialogOpen: false,
    });
    const db = firebase.firestore();
    const userid = firebase.auth().currentUser.uid;

    const [commboardsort, setSort] = React.useState('10');
    const [open, setOpen] = React.useState(false);
      
    // similar to componentDidMount / update but for a function components
    // using functional component cause of useParams above (and React liked
    // functional components more)
    useEffect(() => {
        if(state.board === null) {
            const boardRef = db.doc(`communityBoards/${id}`);
            boardRef.get().then((boardDoc) => {
                if(!boardDoc.exists) {
                    console.log("The community board does not exist");
                    return;
                }

                const board = boardDoc.data();
                const articleReferences = board.articles;
                const articlePromises = articleReferences.map(articleRef =>
                    articleRef.get().then((articleDoc) => {return {
                      ref: articleRef,
                      id: articleDoc.id,
                      ...articleDoc.data()
                    }}
                ));

                Promise.all(articlePromises).then((articles) => {
                    // sort community articles in descending order
                    //console.log("VALUE: ", commboardsort)
                    if(commboardsort === "20"){
                        articles.sort((a, b) => (a.users_eyebrows.length < b.users_eyebrows.length) ? 1 : -1)
                    }
                    setState(prevState => {
                        return {...prevState, articles: articles}
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


    const handleChange = (event) => {
        setSort(event.target.value);
        handleRefreshBoard()
    };
      
    const handleClose = () => {
        setOpen(false);
    };
      
    const handleOpen = () => {
        setOpen(true);
    };

    return (
        <div style={{display: 'flex', flexDirection: 'column', padding: "20px"}} >
            {
                state.board &&
                <h2>{state.board.name}</h2>
            }
            
            <h3>Articles ({state.articles.length})
            
            <InputLabel id="SortByLabel">Sort By</InputLabel>
                <Select 
                  labelId="SortByLabel" 
                  id="select"
                  open={open}
                  onClose={handleClose}
                  onOpen={handleOpen}
                  value={commboardsort}
                  onChange={handleChange}
                >
                    <MenuItem value="10">None</MenuItem>
                    <MenuItem value="20">Raised Eyebrow Count</MenuItem>
                </Select>
            </h3>
            <div style={{display: 'flex', flexWrap: 'wrap'}}>
                {
                    state.articles.map((article) => {
                        return (
                            <div key={article.id} style={{display: 'inline', float: 'left', marginLeft: '1rem'}}>
                                <p>{article.name}</p>
                                <CommunityArticleDisplay
                                // isDialogOpen={state.isDialogOpen}
                                // handleDialogClose={handleDialogClose}
                                url={article.url}
                                ArticleName={article.name}
                                articleId={article.id}
                                articleRef={article.ref}
                                boardId={id}
                                eyebrowArr={article.users_eyebrows}
                                refreshBoard={handleRefreshBoard}
                                />
                            </div>
                        );
                    })
                }
            </div>
        </div>

    )
}

export default CommunityBoard;
