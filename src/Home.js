import React from 'react';
import firebase from "firebase/app";
import { Button } from "@material-ui/core"

class Home extends React.Component {
    constructor(props) {
        super(props)
        this.signOut = this.signOut.bind(this);
    }

    signOut = async (event) => {
        firebase.auth().signOut();
    }

    render() {
        return (
            <div>
                <text>Home page</text>
                <Button color="primary" variant="contained" onClick={this.signOut}>
                    Sign Out
                </Button>
            </div>
        )
    }
}

export default Home;