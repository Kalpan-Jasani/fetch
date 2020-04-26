import React, { useState, useRef, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Typography, Divider, Avatar, IconButton } from '@material-ui/core';
import _ from 'lodash';
import CloseIcon from '@material-ui/icons/Close';

import firebase from "firebase/app";

import {getInitials} from './util';

import './ActivityBar.css';
/**
 * This component is for the homepage's recent activity
 */

 /**
 * 
 * @param {*} props: none
 */
function ActivityBar(props) {

    const [activities, setActivities] = useState([]);
    const subscribedFlag = useRef(false);       // initially not subscribed
    const userid = firebase.auth().currentUser.uid;
    const db = firebase.firestore();
    const history = useHistory();

    // id of activity that is hovered over
    const [hoverActivity, setHoverActivity] = useState(null);

    /**
     * subscribe to activities using hooks by react
     */
    useEffect(() => {
        if(! subscribedFlag.current) {   // if not subscribed
            subscribedFlag.current = true;  // mark as subscribed
            const unsubscribe = subscribeActivities(setActivities, {userid, db});
            return () => {
                subscribedFlag.current = false;     // mark as unsubscribed
                unsubscribe && unsubscribe();       // unsubscribe
            }
        }
    }, [subscribedFlag.current]);

    const handleClick = (activity) => {
        if(activity.link) {
            history.push(activity.link);
        }
    };

    const deleteActivity = (activityId) => {
        db.doc(`users/${userid}/activities/${activityId}`).delete();
    }


    return (
        <div className="activity-bar">
            <Typography variant="h6">
                Recent Activity
            </Typography>
            <div className="activity-bar__activities">
                { activities.map(activity => 
                    <div key={activity.id}>
                        <div className="activity-bar__activities__activity" onClick={() => handleClick(activity)}
                            onMouseEnter={() => setHoverActivity(activity.id)}
                            onMouseLeave={() => setHoverActivity(null)}>
                            <div className="activity__logo">
                                { activity.user && 
                                    (activity.user.photoURL ?
                                        <Avatar src={activity.user.photoURL}/> :
                                        <Avatar>{getInitials(activity.user.name)}</Avatar>
                                    )
                                }
                            </div>
                            <div className="activity__content">
                                <p>{activity.message}</p>
                            </div>
                            {hoverActivity == activity.id &&
                                <div className="activity__close" onClick={e => {
                                    // prevent bubbling up event to ancestors
                                    e.stopPropagation();
                                    deleteActivity(activity.id);
                                }}>
                                    <CloseIcon fontSize="small"/>
                                </div>
                            }
                        </div>
                        <Divider></Divider>
                    </div>
                )
                }
            </div>
        </div>
    )

}


/**
 * subscribe to activties from firebase
 * 
 * This will obtain all the activities for the user. Activity is of the form
 * 
 *  user: optional, a user ref is a firebase user
 *  message: the content
 *  link: optional, the link to something relevant to the activity 
 *      (for eg. the new personal board)
 *  timestamp: the time of this activity
 * 
 *  return: the callback that is called to unsubscribe from firebase
 */
function subscribeActivities(updateActivities, context) {
    const db = context.db;

    /* get last 15 recent activities stored for the user */
    const unsubscribe = db.collection(`users/${context.userid}/activities`).
      orderBy('timestamp', "desc").
      limitToLast(15).onSnapshot(async (s) => {
        /* create interface which can be stored as state for the activity bar
         * fetch the user from the mentioned user reference and store it in
         * the object that will go in the final array
         */
        const activities = await Promise.all(s.docs.map(async doc => {
            /* create activity object by fetching user's information */
            const activityData = doc.data();
            let activity = {...activityData};
            activity.id = doc.id;
            if(activityData.user) {     // if user exists in this activity's data
                const s2 = await activityData.user.get();
                const userData = s2.data();
                activity.user = _.pick(userData, ['name', 'photoURL']);     // pick required fields
            }
            return activity;
        }));

        updateActivities(activities);
    }, err => {
        console.error(err);
        console.error("could not subscribe to recent activities");
        alert("Could not subscribe to recent activities");
    });

    return unsubscribe;
}

export default ActivityBar;