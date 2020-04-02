import React from 'react';
import firebase from "firebase/app";
import { Card, CardContent, Typography, Avatar, Button } from "@material-ui/core";
import { withRouter, Link } from 'react-router-dom';

class PersonalBoardFollowers extends React.Component {
    
    constructor(props) {
        super(props);

        this.state = {"users": undefined}
        this.getUserCards = this.getUserCards.bind(this);
        this.getInitials = this.getInitials.bind(this);
    }

    componentDidMount() {
        var user = firebase.auth().currentUser;
        if (user !== undefined) {
            firebase.firestore()
                .collection("users")
                .where('pboardFollowing', 'array-contains', `${this.props.match.params.id}`)
                .onSnapshot((querySnapshot) => {
                    var data = querySnapshot.docs;
                    var profiles = [];
                    data.forEach((doc) => {
                        var fields = doc.data();
                        profiles.push({
                            name: fields.name,
                            photoURL: fields.photoURL,
                            id: doc.id
                        });
                    });
                    console.log(profiles);
                    this.setState({
                        users: profiles,
                    });
                }).bind(this);
        }
    }

    async followUser(uid) {
        var user = firebase.auth().currentUser;
        if (user.uid !== undefined) {
            var path = firebase.firestore().collection("users").doc(user.uid);

            var followPath = firebase.firestore().collection("users").doc(uid);
            console.log(`Follow path ${user.uid}`);
            console.log(`Other path ${uid}`);

            await firebase.firestore().runTransaction((transaction) => {
                return transaction.get(path).then((doc) => {
                    var fields = doc.data();
                    var following = fields.following ?? [];
                    following.push(uid);
                    console.log(following);

                    transaction.update(path, {following: following});
                })
            });

            await firebase.firestore().runTransaction((followTransaction) => {
                return followTransaction.get(followPath).then((doc) => {
                    var fields = doc.data();
                    var followers = fields.followers ?? [];
                    followers.push(user.uid);
                    console.log(followers);

                    followTransaction.update(followPath, {followers: followers});
                })
            });

            console.log("success")
        } else {
            console.log("User is not signed in!");
        }
    }

    async unfollowUser(uid) {
        var user = firebase.auth().currentUser;
        if (user.uid !== undefined) {
            var path = firebase.firestore().collection("users").doc(user.uid);

            var followPath = firebase.firestore().collection("users").doc(uid);

            await firebase.firestore().runTransaction((transaction) => {
                return transaction.get(path).then((doc) => {
                    var fields = doc.data();
                    var following = fields.following ?? [];
                    var index = following.indexOf(uid);
                    if (index > -1) {
                        following.splice(index, 1);
                    } else {
                        console.log("user is not following!");
                    }
                    console.log(following);

                    transaction.update(path, {following: following});
                })
            });

            await firebase.firestore().runTransaction((followTransaction) => {
                return followTransaction.get(followPath).then((doc) => {
                    var fields = doc.data();
                    var followers = fields.followers ?? [];
                    var index = followers.indexOf(user.uid);
                    if (index > -1) {
                        followers.splice(index, 1);
                    } else {
                        console.log("user is not a follower!");
                    }
                    console.log(followers);

                    followTransaction.update(followPath, {followers: followers});
                })
            });

            console.log("success")
        } else {
            console.log("User is not signed in!");
        }
    }

    getInitials = (string) => {
        var names = string.split(' '),
            initials = names[0].substring(0, 1).toUpperCase();

        if (names.length > 1) {
            initials += names[names.length - 1].substring(0, 1).toUpperCase();
        }
        return initials;
    }

    getUserCards() {
        if (this.state.users === undefined || this.state.users.length === 0) {
            return <div style={{justifyContent: 'center', alignItems: 'center'}}>
                <h2>None</h2>
            </div>
        } else {
            return this.state.users.map((user) => {
                return <div style={{justifyContent: 'center', display: 'flex', alignItems: 'center', flexDirection: 'column', minWidth: 200, minHeight: 100, margin: 10, borderBottom: 1, borderTop: 0, borderLeft: 0, borderRight: 0, borderStyle: 'solid', borderColor: 'grey'}}>
                    {user.photoURL === "" && user.name !== ""
                        ? <Avatar style={{height: 55, width: 55}}>{this.getInitials(user.name)}</Avatar>
                        : <Avatar src={user.photoURL} alt="" style={{height: 55, width: 55}}/>}
                    <div style={{height: 10}} />
                    <Typography style={{fontSize: 20}}>{user.name}</Typography>
                    <div style={{height: 10}} />
                    <Link to={`/profile/${user.id}`} style={{textDecoration: 'none'}}>
                        <Button color="primary" variant="outlined">
                            View Profile
                        </Button>
                    </Link>
                    <div style={{height: 10}} />
                </div>
            })
        }
    }


    render() {
        console.log(this.props);
        return (
         <div>
            <h1>{"Followers"}</h1>
            <body>
                <Card style={{ minWidth: 550, minHeight: 400, marginBottom: 25, marginTop: 50 }}>
                        <CardContent>
                            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', height: '100%', width: '100%' }}>
                                {this.getUserCards()}
                            </div>
                        </CardContent>
                    </Card>
            </body>
         </div>   
        )
    }
}

export default withRouter(PersonalBoardFollowers);