import React from 'react';
import firebase from "firebase/app";
import SearchBar from 'material-ui-search-bar';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, CircularProgress, Card, CardContent, CardActions, Typography, Avatar } from "@material-ui/core";
import { withRouter } from 'react-router-dom';

class Users extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {"users": undefined, "search": ""}
        this.filterSearch = this.filterSearch.bind(this);
        this.getUserCards = this.getUserCards.bind(this);
        this.getInitials = this.getInitials.bind(this);
    }

    componentDidMount() {
        var user = firebase.auth().currentUser;
        if (user !== undefined) {
            firebase.firestore()
                .collection("users")
                .onSnapshot((querySnapshot) => {
                    var data = querySnapshot.docs;
                    var profiles = [];
                    data.forEach((doc) => {
                        var fields = doc.data();
                        if (fields.name !== null && doc.id !== user.uid) {
                            profiles.push({
                                name: fields.name,
                                photoURL: fields.photoURL,
                                id: doc.id
                            });
                        }
                    });
                    console.log(profiles);
                    this.setState({
                        users: profiles,
                    });
                }).bind(this);
        }
    }

    filterSearch(query) {
        if (this.state.users !== undefined) {
          var names = this.state.users.filter((x) => {
              if (x.name !== null) {
                return x.name.includes(query);
              }
          })
          this.setState({
              search: names
          });
        };
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
        if (this.state.users === undefined) {
            return <div style={{justifyContent: 'center', alignItems: 'center'}}>
                <text>No Users Found</text>
            </div>
        } else {
            return this.state.users.map((user) => {
                return <div style={{justifyContent: 'center', display: 'flex', alignItems: 'center', flexDirection: 'column', minWidth: 200, minHeight: 100, margin: 10, borderBottom: 1, borderTop: 0, borderLeft: 0, borderRight: 0, borderStyle: 'solid', borderColor: 'grey'}}>
                    {user.photoUrl === "" && user.name !== ""
                        ? <Avatar style={{height: 120, width: 120}}>{this.getInitials(user.name)}</Avatar>
                        : <Avatar src={user.photoURL} alt="" style={{height: 55, width: 55}}/>}
                    <div style={{height: 10}} />
                    <Typography style={{fontSize: 20}}>{user.name}</Typography>
                    <div style={{height: 10}} />
                    <Button color="primary" variant="outlined">Follow</Button>
                    <div style={{height: 10}} />
                </div>
            })
        }
    }


    render() {
        return (
         <div>
            <SearchBar
                value={this.state.search}
                onChange={(value) => {
                    this.filterSearch(value);
                    this.setState({
                        search: value
                    });
                }}
                onRequestSearch={() => console.log('onRequestSearch')}
                style={{
                  margin: '0 auto',
                  maxWidth: 800
                }}
            />
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

export default withRouter(Users);