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
                        profiles.push({
                            name: fields.name,
                            photoUrl: fields.photoUrl,
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

    filterSearch(query) {
        if (this.state.users !== undefined) {
          console.log("start");
          var names = this.state.users.filter((x) => {
              if (x.name !== null) {
                return x.name.includes(query);
              }
          })
          console.log(names);
        };
        
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
                <text>hi</text>
            </body>
         </div>   
        )
    }
}

export default withRouter(Users);