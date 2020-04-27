import firebase from "firebase";

export const idInRefs = (l, id) => l.map(e => e.id).includes(id);

export const blockedUser = async (uid) => {
    const db = firebase.firestore();
    const currentUser = firebase.auth().currentUser;
    const userDoc = await db.doc(`users/${currentUser.uid}`).get();
    const userData = userDoc.data();
    return (idInRefs(userData.blocked_users ?? [], uid));
}

export const getInitials = (string) => {
    var names = string.split(' '),
        initials = names[0].substring(0, 1).toUpperCase();

    if (names.length > 1) {
        initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
}

/* displayable name for current user which will be shown in activity */
export const getDisplayName = async () => {
    const user = firebase.auth().currentUser;
    const userRef = firebase.firestore().doc(`users/${user.uid}`);
    return (await userRef.get()).data().name || user.displayName || user.email || "";

}

/**
 * Create recent activities for users
 * 
 * @param {Object} activity: object with the following fields:
 *  user: optional, a user ref is a firebase user
 *  message: the content
 *  link: optional, the link to something relevant to the activity 
 *      (for eg. the new personal board)
 *  timestamp: the time of this activity. optional. if not provided, current
 *      time will be put
 * 
 * @param {List[int]} userids: array of userids to which to send an update to
 * 
 * This method is meant to create a "recent activity" for the provided users
 * 
 */
export const sendUpdate = async (activity, userids) => {
    const db = firebase.firestore();
    const promises = [];

    if(!activity.message) {
        throw new Error("invalid arguments");
    }

    const activity2 = {
        ...activity,
        timestamp: activity.timestamp || new Date(),
    }


    /**
     * update activity of all users. 
     * TODO-LONGTERM: in big applications, 
     * this should be done in the backend as the GUI is blocked while this happens
     * 
     * Also, if done in front-end, should display snackbar and do batched writes
    */
    userids.forEach(userid => {
        const activityRef = db.collection(`users/${userid}/activities`);
        promises.push(activityRef.add(activity2).catch(e => {
            console.error(`could not update recent activities for user with id ${userid}`);
            console.error(e);
        }));
    });

    await Promise.all(promises);
};