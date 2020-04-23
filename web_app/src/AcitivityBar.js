import React, { useState, useRef, useEffect } from 'react';
import { Typography, Divider } from '@material-ui/core';

import firebase from "firebase/app";

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

    /**
     * subscribe to activities using hooks by react
     */
    useEffect(() => {
        if(! subscribedFlag.current) {   // if not subscribed
            const unsubscribe = subscribeActivities(setActivities, {userid, db});
            return () => {
                unsubscribe && unsubscribe();
            }
        }
    }, [subscribedFlag.current]);

    return (
        <div class="activity-bar">
            <Typography variant="h6">
                Recent Activity
            </Typography>
            <div class="activity-bar__activities">
                { activities.map(activity => 
                    /* TODO render activity */
                    <div class="activity_bar__activities__activity">
                        { activity.user &&
                            <p>User: {activity.user.displayName}</p>
                        }
                        <p>{activity.message}</p>
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
 *  user: optional, a user is a firebase user
 *  message: the content
 *  link: optional, the link to something relevant to the activity 
 *      (for eg. the new personal board)
 * 
 *  return: the callback that is called to unsubscribe from firebase
 */
function subscribeActivities(updateActivities, context) {
    // TODO: implement properly
    updateActivities([
        {
            user: firebase.auth().currentUser,
            message: "Added a new personal board politics"
        }
    ])

    return () => {
        console.debug("unsubscribed");
    };
}

export default ActivityBar;