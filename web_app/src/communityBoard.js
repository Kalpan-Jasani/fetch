import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from '@material-ui/core';
import firebase from 'firebase';
import Button from '@material-ui/core/Button';
import ArticleDisplay from './CommunityArticleDisplay';
import './personalBoard.css';
import { Divider, Select, MenuItem, InputLabel } from '@material-ui/core';

function CommunityBoard(props) {
    const { id } = useParams();
    const db = firebase.firestore();
    const userid = firebase.auth().currentUser.uid;

    const [board, updateBoard] = React.useState(null);
    const [articles, setArticles] = React.useState([]);       // for articles
    const [commboardsort, setSort] = React.useState('10');
    const [open, setOpen] = React.useState(false);
      
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
            return boardRef.onSnapshot( async (boardDoc) => {
                if(!boardDoc.exists) {
                    alert("The board does not exist");
                    return;
                }

                /* store articles in a sorted order after fetching them */
                
                const board = boardDoc.data();
                const articleReferences = board.articles;
                const articlePromises = articleReferences.map(articleRef =>
                    articleRef.get().then((articleDoc) => {return {
                      ref: articleRef,
                      id: articleDoc.id,
                      ...articleDoc.data(),
                      users_eyebrows: articleDoc.data().users_eyebrows || [],
                    }}
                ));
                
                let articles_ = [];
                try {
                    articles_ = await Promise.all(articlePromises);
                }

                catch {
                    console.log('error');
                    return;
                }

                setArticles(articles_);
                updateBoard({ref: boardRef, ...boardDoc.data()});
            },
            (err) => alert(`error: ${String(err)}`)
            );
        }
    });

    const sortArticles = () => {
        const articles_ = articles;

        // sort community articles in descending order
        if(commboardsort === "20"){
            articles_.sort((a, b) => (a.users_eyebrows.length < b.users_eyebrows.length) ? 1 : -1)
        }
        setArticles(articles_);     // update stored state of articles 
                                // (no refetching)
    } 

    const handleChange = (event) => {
        setSort(event.target.value);
        sortArticles();
    };
      
    const handleClose = () => {
        setOpen(false);
    };
      
    const handleOpen = () => {
        setOpen(true);
    };

    return (
        board !== null ? 
            <div style={{display: 'flex', flexDirection: 'column', padding: "20px"}} >
                {
                    <h2>{board.name}</h2>
                }
                <h3>Articles ({board.articles.length})
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
                <Divider></Divider>
                <div style={{display: 'flex', flexWrap: 'wrap'}}>
                    {
                        articles.map(article => <ArticleDisplay 
                            articleRef={article.ref}
                            key={article.ref.id}
                            inRaisedEyebrowPage={false} />)
                    }
                </div>
            </div>
            :
            <p>Loading</p>
    )
}
export default CommunityBoard;