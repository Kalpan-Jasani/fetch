import React from 'react';
import firebase from "firebase/app";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, CircularProgress } from "@material-ui/core";
import { withRouter } from 'react-router-dom';

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {open: false, loading: false}
        this.signOut = this.signOut.bind(this);
        this.handleClickClose = this.handleClickClose.bind(this);
        this.handleClickOpen = this.handleClickOpen.bind(this);
        this.deleteAccount = this.deleteAccount.bind(this);
    }

    signOut = async (event) => {
        firebase.auth().signOut();
        this.props.history.push("/login");
    }

    handleClickOpen = (event) => {
        this.props.history.push("/profile");
    }

    handleClickClose = (event) => {
        this.setState({
            open: false
        });
    }

    deleteAccount = async (event) => {
        this.setState({
            loading: true
        });
        var uid = firebase.auth().currentUser.uid;
        if (uid !== undefined) {
            var deleteAccountFunction = firebase.functions().httpsCallable("deleteAccount");
            var result = await deleteAccountFunction({text: uid});
            console.log(result.data);
        } else {
            console.log("User is not signed in!");
        }
        this.setState({
            loading: false,
            open: false
        });
        this.props.history.push("/login");
    }

    render() {
        return (
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center'}}>
                <Button color="primary" variant="contained" onClick={this.signOut}>
                    Sign Out
                </Button>
                <Button variant="outlined" color="secondary" onClick={this.handleClickOpen}>
                    Profile Page
                </Button>
                <Dialog open={this.state.open} onClose={this.handleClickClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
                    <DialogTitle id="alert-dialog-title">{"Delete Account?"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            Deleting your account will remove all data associated with your account. This can not be reversed.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClickClose} color="primary" disabled={this.state.loading}>
                            Cancel
                        </Button>
                        <div style={{position: 'relative'}}>
                            <Button onClick={this.deleteAccount} color="secondary" variant="contained" disabled={this.state.loading}>
                                Delete
                            </Button>
                            {this.state.loading && <CircularProgress size={24} style={{position: 'absolute', top: '50%', left: '50%', marginTop: -12, marginLeft: -12}}/>}
                        </div>
                    </DialogActions>
                </Dialog>
            </div>
        )
    }
}

export default withRouter(Home);