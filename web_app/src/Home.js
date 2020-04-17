import React from 'react';
import firebase from "firebase/app";
import { Button, Divider } from "@material-ui/core";
import { withRouter } from 'react-router-dom';

import './homepage.css';

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {open: false, loading: false}
        this.signOut = this.signOut.bind(this);
    }

    signOut = async (event) => {
        firebase.auth().signOut();
        this.props.history.push("/login");
    }


    render() {
        return (
            <div id="homepage-content">
                <h2>
                    Home
                </h2>
                <h3>Recent articles</h3>
                <Divider></Divider>
                <p>article 1</p>
                <p>article 2</p>
                <h3>Recent personal boards</h3>
                <Divider></Divider>
                <p>board 1</p>
                <p>board 2</p>
                <h3>Recent communities</h3>
                <Divider></Divider>
                <p>community 1</p>
                <p>community 2</p>
                <h3>Recent activity</h3>
                <Divider></Divider>
                <p>user x commented on community article 1</p>
                <p>user y added a new playlist</p>
                <Button color="primary" variant="contained" onClick={this.signOut}>
                    Sign Out
                </Button>
            </div>
        )
    }
}

export default withRouter(Home);