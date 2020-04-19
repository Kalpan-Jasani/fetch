import firebase from "firebase";

const idInRefs = (l, id) => l.map(e => e.id).includes(id);

const blockedUser = async (uid) => {
    const db = firebase.firestore();
    const currentUser = firebase.auth().currentUser;
    const userDoc = await db.doc(`users/${currentUser.uid}`).get();
    const userData = userDoc.data();
    return (idInRefs(userData.blocked_users ?? [], uid));
}

export {idInRefs, blockedUser};