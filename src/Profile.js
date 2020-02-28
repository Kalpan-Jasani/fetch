import React from 'react';
import firebase from "firebase/app";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, CircularProgress, Card, CardContent, CardActions, Typography, Avatar } from "@material-ui/core";
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator';
import { withRouter } from 'react-router-dom';

class Profile extends React.Component {
    constructor(props) {
        super(props);
        this.state = { open: false, loadDelete: false, saving: false, name: "", email: "", photoURL: "", platform: "" }
        this.signOut = this.signOut.bind(this);
        this.handleClickClose = this.handleClickClose.bind(this);
        this.handleClickOpen = this.handleClickOpen.bind(this);
        this.deleteAccount = this.deleteAccount.bind(this);
        this.changeNameHandler = this.changeNameHandler.bind(this);
        this.changePhotoURLHandler = this.changePhotoURLHandler.bind(this);
        this.submitHandler = this.submitHandler.bind(this);
    }

    componentDidMount() {
        var user = firebase.auth().currentUser;
        if (user !== undefined) {
            firebase.firestore()
                .collection("users")
                .doc(user.uid)
                .onSnapshot((documentSnapshot) => {
                    var data = documentSnapshot.data();
                    if (data !== undefined) {
                        this.setState({
                            name: data.name,
                            email: data.email,
                            photoURL: data.photoURL,
                            platform: data.platform
                        });
                    }
                }).bind(this);
        }
    }

    submitHandler = async (event) => {
        this.setState({
            saving: true
        });
        var user = firebase.auth().currentUser;
        await firebase.firestore()
            .collection("users")
            .doc(user.uid)
            .update({
                name: this.state.name,
                photoURL: user.photoURL,
            });
        this.setState({
            saving: false
        });
    }

    changeNameHandler = (event) => {
        if (!this.state.saving) {
            this.setState({ name: event.target.value });
        }
    }

    changePhotoURLHandler = (event) => {
        if (!this.state.saving) {
            this.setState({ photoURL: event.target.value });
        }
    }

    signOut = async (event) => {
        firebase.auth().signOut();
        this.props.history.push("/login");
    }

    handleClickOpen = (event) => {
        this.setState({
            open: true
        });
    }

    handleClickClose = (event) => {
        this.setState({
            open: false
        });
    }

    deleteAccount = async (event) => {
        this.setState({
            loadDelete: true
        });
        var uid = firebase.auth().currentUser.uid;
        if (uid !== undefined) {
            var deleteAccountFunction = firebase.functions().httpsCallable("deleteAccount");
            var result = await deleteAccountFunction({ text: uid });
            console.log(result.data);
        } else {
            console.log("User is not signed in!");
        }
        firebase.auth().signOut();
        this.setState({
            loadDelete: false,
            open: false
        });
    }

    getInitials = (string) => {
        var names = string.split(' '),
            initials = names[0].substring(0, 1).toUpperCase();

        if (names.length > 1) {
            initials += names[names.length - 1].substring(0, 1).toUpperCase();
        }
        return initials;
    }

    render() {
        return (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <body style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <Card style={{ minWidth: 550, minHeight: 400, marginBottom: 25 }}>
                        <CardContent>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography gutterBottom variant="h5" component="h2">
                                    Profile Info
                            </Typography>
                                {this.state.photoURL === "" && this.state.name !== ""
                                    ? <Avatar>{this.getInitials(this.state.name)}</Avatar>
                                    : <Avatar src={this.state.photoURL} alt="" />}
                            </div>
                            <ValidatorForm
                                onSubmit={this.submitHandler}
                                instantValidate={false}
                                style={{ paddingLeft: 50, flexDirection: 'column', display: 'flex', paddingRight: 50, justifyContent: 'space-around', height: 350 }}
                            >
                                <Typography gutterBottom variant="body1">
                                    {`Email: ${this.state.email}`}
                                </Typography>
                                {this.state.platform !== undefined
                                    ? <Typography gutterBottom variant="body1">
                                        {`Platform: ${this.state.platform}`}
                                    </Typography>
                                    : null}
                                <TextValidator id="standard-basic" label="Name" value={this.state.name} onChange={this.changeNameHandler} validators={['required']} errorMessages={['This field is required']} />
                                <TextValidator id="standard-basic" label="Photo URL" value={this.state.photoURL} onChange={this.changePhotoURLHandler} />
                                <CardActions style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: 20 }}>
                                    <div style={{ position: 'relative' }}>
                                        <Button color="primary" variant="contained" disabled={this.state.saving} type="submit">
                                            Save
                                        </Button>
                                        {this.state.saving && <CircularProgress size={24} style={{ position: 'absolute', top: '50%', left: '50%', marginTop: -12, marginLeft: -12 }} />}
                                    </div>
                                </CardActions>
                            </ValidatorForm>
                        </CardContent>
                    </Card>
                </body>
                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', paddingLeft: 150, paddingRight: 150 }}>
                    <Button color="primary" variant="contained" onClick={this.signOut}>
                        Sign Out
                    </Button>
                    <Button variant="outlined" color="secondary" onClick={this.handleClickOpen}>
                        Delete Account
                    </Button>
                </div>
                <Dialog open={this.state.open} onClose={this.handleClickClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
                    <DialogTitle id="alert-dialog-title">{"Delete Account?"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            Deleting your account will remove all data associated with your account. This can not be reversed.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClickClose} color="primary" disabled={this.state.loadDelete}>
                            Cancel
                        </Button>
                        <div style={{ position: 'relative' }}>
                            <Button onClick={this.deleteAccount} color="secondary" variant="contained" disabled={this.state.loadDelete}>
                                Delete
                            </Button>
                            {this.state.loadDelete && <CircularProgress size={24} style={{ position: 'absolute', top: '50%', left: '50%', marginTop: -12, marginLeft: -12 }} />}
                        </div>
                    </DialogActions>
                </Dialog>
            </div>
        )
    }
}

export default withRouter(Profile);