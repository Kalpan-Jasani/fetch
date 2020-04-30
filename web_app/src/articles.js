import React, { useEffect, useRef, useState } from 'react';
import firebase from 'firebase';
import { Typography, Card } from '@material-ui/core';

import ArticleDisplay from './ArticleDisplay';

import './articles.css';

export default function Articles(props) {
    const subscribedRef = useRef(false);
    const db = firebase.firestore();
    const userid = firebase.auth().currentUser.uid;
    const [articles, setArticles] = useState([]);

    useEffect(() => {
        if(!subscribedRef.current) {// if not subscribed
            subscribedRef.current = true;       // mark as subscribed
            db.collection(`localArticles/users/${userid}`).onSnapshot(querySnapshot => {
                const articles2 = querySnapshot.docs.map(articleSnapshot => ({
                    ...articleSnapshot.data(),
                    id: articleSnapshot.id,
                    ref: articleSnapshot.ref,
                }));

                setArticles(articles2);
            }, err => {
                alert('could not fetch the articles');
                console.error('All articles for users could not be fetched');
                console.error(err);
            });
            
        }
    }, [subscribedRef.current, userid]);

    return (
        <div className="page-container">
            <Typography variant="h4" component="h1">Personal articles ({articles.length})</Typography>
            <div className="articlesContainer">
                {
                    articles.map(article =>
                        <div key={article.id} className="articlesContainer__articleWrapper">
                            <ArticleDisplay
                                articleRef={article.ref}
                            />
                        </div>
                    )
                }
            </div>
        </div>
    )
}