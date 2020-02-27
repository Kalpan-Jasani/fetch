const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.deleteAccount = functions.https.onCall(async (data, context) => {
    const uid = context.auth.uid;
    const uidRequest = data.text;

    if (uid === uidRequest) {
        await admin.firestore().collection("users").doc(uid).delete();
        await admin.auth().deleteUser(uid);

        return {
            status: "Success"
        }
    } else {
        return {
            status: "Request does not equal UID"
        }
    }
});
