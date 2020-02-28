import React from 'react';
import firebase from "firebase/app";
import { Button } from "@material-ui/core";
import { withRouter } from 'react-router-dom';

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
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', alignItems: 'center'}}>
                <h2>
                    Home
                </h2>
                <Button color="primary" variant="contained" onClick={this.signOut}>
                    Sign Out
                </Button>
            </div>
        )
    }
}

export default withRouter(Home);