import firebase from "firebase";

const idInRefs = (l, id) => l.map(e => e.id).includes(id);

const blockedUser = async (uid) => {
    const db = firebase.firestore();
    const currentUser = firebase.auth().currentUser;
    const userDoc = await db.doc(`users/${currentUser.uid}`).get();
    const userData = userDoc.data();
    return (idInRefs(userData.blocked_users ?? [], uid));
}

const getInitials = (string) => {
    var names = string.split(' '),
        initials = names[0].substring(0, 1).toUpperCase();

    if (names.length > 1) {
        initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
}

export {idInRefs, blockedUser, getInitials};