import React, { useEffect, useRef, useState } from 'react';
import firebase from "firebase/app";
import { Button, Divider } from "@material-ui/core";
import { withRouter } from 'react-router-dom';

import './homepage.css';

const subscribeToBoards = (updateBoards) => {
    const db = firebase.firestore();
    const userid = firebase.auth().currentUser.uid;

    /**
     * firebase query: get all boards with lastUpdatedTime,
     * sorted in descending order, and limit the results to 5
     */
    const boardsRef = db.collection(`personalBoards/${userid}/pboards/`);
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

const subscribeToArticles = (updateArticles) => {
    return () => {};
};

const subscribeToCommunities = (updateCommunities) => {
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
        const unsubscribeBoards = subscribeToBoards(updateBoards);
        const unsubscribeArticles = subscribeToArticles(updateArticles);
        const unsubscribeCommunities = subscribeToCommunities(updateCommunities);

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


    const signOut = async (event) => {
        await firebase.auth().signOut();
        props.history.push("/login");
    }

    return (
        <div id="homepage-content">
            <h2>
                Home
            </h2>
            <h3>Recent articles</h3>
            <Divider></Divider>
            <p>article 1</p>
            <p>article 2</p>
            <h3>Recent personal boards</h3>
            <Divider></Divider>
            { 
                boards.map((board) => (
                    <p>{board.boardName}</p>
                ))
            }
            <h3>Recent communities</h3>
            <Divider></Divider>
            <p>community 1</p>
            <p>community 2</p>
            <h3>Recent activity</h3>
            <Divider></Divider>
            <p>user x commented on community article 1</p>
            <p>user y added a new playlist</p>
            <Button color="primary" variant="contained" onClick={signOut}>
                Sign Out
            </Button>
        </div>
    );
}

export default withRouter(Home);