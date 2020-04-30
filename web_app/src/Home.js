import React, { useEffect, useRef, useState } from 'react';
import firebase from "firebase/app";
import { Button, Divider, Card, CardMedia, CardContent, Typography } from "@material-ui/core";
import { withRouter, Link } from 'react-router-dom';

import ArticleDisplay from './ArticleDisplay';
import './homepage.css';
import logo from './Assets/fetch.png';
import ActivityBar from './AcitivityBar';

// TODO: allow loading symbol when stuff from firebase is still being fetched

const subscribeToBoards = (updateBoards, context) => {

    /**
     * firebase query: get all boards with lastUpdatedTime,
     * sorted in descending order, and limit the results to 5
     */
    const boardsRef = context.db.collection(`personalBoards/${context.userid}/pboards/`);
    const query = boardsRef.orderBy("lastSeenTime", "desc").limit(5);

    const unsubscribe = query.onSnapshot((querySnapshot) => {
        const boards = querySnapshot.docs.map(docSnapshot => ({
            ...docSnapshot.data(),
            ref: docSnapshot.ref
        }));
        updateBoards(boards);
    }, (err) =>  {
        console.error("could not read boards");
        console.error(err);
        alert("could not read boards");
    });

    return unsubscribe;
}

const subscribeToArticles = (updateArticles, context) => {
    const articlesRef = context.db.collection(`localArticles/users/${context.userid}/`);
    const query = articlesRef.orderBy("lastSeenTime", "desc").limit(5);

    const unsubscribe = query.onSnapshot((querySnapshot) => {
        const articles = querySnapshot.docs.map(doc => ({
            ...doc.data(),
            ref: doc.ref
        }));

        updateArticles(articles);
    }, (err) => {
        console.error("could not read articles");
        console.error(err);
        alert("could not read articles");
    })
    return unsubscribe;
};

const subscribeToCommunities = (updateCommunities, context) => {
    return () => {};
};


function Home(props) {
    const db = firebase.firestore();
    const userid = firebase.auth().currentUser.uid;
    const firebaseSubscriptions = useRef({
        recentBoards: false,
        recentArticles: false,
        recentCommunities: false,
    });
    
    const [boards, updateBoards] = useState([]);
    const [articles, updateArticles] = useState([]);
    const [communities, updateCommunities] = useState([]);
    
    useEffect(() => {
        /* mark as subscribed */
        firebaseSubscriptions.current.recentBoards = true;
        firebaseSubscriptions.current.recentArticles = true;
        firebaseSubscriptions.current.recentCommunities = true;

        /* subscribe to changes */
        const unsubscribeBoards = subscribeToBoards(updateBoards, {db, userid});
        const unsubscribeArticles = subscribeToArticles(updateArticles, {db, userid});
        const unsubscribeCommunities = subscribeToCommunities(updateCommunities, {db, userid});

        return () => {
            /* unsubscribe and mark it as such */
            unsubscribeBoards && unsubscribeBoards();
            firebaseSubscriptions.current.recentBoards = false;
            unsubscribeArticles && unsubscribeArticles();
            firebaseSubscriptions.current.recentArticles = false;
            unsubscribeCommunities && unsubscribeCommunities();
            firebaseSubscriptions.current.recentCommunities = false;
        }
    }, [firebaseSubscriptions.current.recentBoards, firebaseSubscriptions.current.recentArticles, 
        firebaseSubscriptions.current.recentCommunities]);

    return (
        <div className="homepage-container">
            <div className="homepage-content">
                <h2>
                    Home
                </h2>
                <h3>Recent articles</h3>
                <Divider></Divider>
                    <div className="recent-articles-container">
                    {
                        articles.map((article) => (
                            <Card key={article.ref.id} className="recent-articles-container__article-card">
                                <ArticleDisplay 
                                    articleRef={article.ref}
                                    key={article.ref.id}
                                />
                            </Card>
                        ))
                    }
                    </div>
                {
                    articles.length == 0 &&
                        <p>No recent articles</p>
                }
                <h3>Recent personal boards</h3>
                <Divider></Divider>
                <div className="recent-boards-container">
                    {
                        boards.map((board) => (
                            <Card key={board.ref.id} className="recent-boards-container__recent-board-card">
                                <CardMedia
                                    style={{height: 0, paddingTop: '50%'}}
                                    image={logo}
                                />
                                <CardContent>
                                    <Typography variant="h6" component="p">
                                        {board.boardName}
                                    </Typography>
                                    <Link to={`/boards/${board.ref.id}`}>
                                        <Button variant="contained" color="default" disableElevation>
                                            View
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))
                    }
                </div>
                {
                    boards.length == 0 &&
                        <p>No recent boards</p>
                }
                <h3>Recent communities</h3>
                <Divider></Divider>
                <p>community 1</p>
                <p>community 2</p>
            </div>
            <ActivityBar/>
        </div>
    );
}

export default withRouter(Home);