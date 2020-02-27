import React from 'react';
import firebase from "firebase/app";
import { TextField, Card, CardActions, CardContent, Button, Typography } from '@material-ui/core';
import logo from './Assets/fetch.png'
import GoogleButton from 'react-google-button'

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {email: '', password: ''}

        this.changeEmailHandler = this.changeEmailHandler.bind(this);
        this.changePasswordHandler = this.changePasswordHandler.bind(this);
        this.submitHandler = this.submitHandler.bind(this);
        this.handleGoogleSignIn = this.handleGoogleSignIn.bind(this);
        this.handleAppleSignIn = this.handleAppleSignIn.bind(this);
    }

    submitHandler = async (event) => {
        event.preventDefault()
        var loginSuccess = await firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password);
        console.log(loginSuccess);
        
    }

    changeEmailHandler = (event) => {
        this.setState({email: event.target.value})
    }

    changePasswordHandler = (event) => {
        this.setState({password: event.target.value})
    }

    handleGoogleSignIn = async (event) => {
        var googleProvider = new firebase.auth.GoogleAuthProvider();
        var result = await firebase.auth().signInWithPopup(googleProvider).catch((error) => {
            console.log(error.code);
        });

        console.log(result);
    }

    handleAppleSignIn = async (event) => {
        var appleProvider = new firebase.auth.OAuthProvider('apple.com');
        var result = await firebase.auth().signInWithPopup(appleProvider).catch((error) => {
            console.log(error.code)
        });

        console.log(result);
    }

    render() {
        return (
            <div className="Login">
                <header style={{display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 50}}>
                    <img src={logo} alt="logo" />
                </header>
                <body style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <Card style={{minWidth: 550, minHeight: 300, marginBottom: 25}}>
                        <CardContent>
                        <Typography gutterBottom variant="h5" component="h2">
                          Login Info
                        </Typography>
                        <form 
                        onSubmit={this.submitHandler}
                        style={{paddingLeft: 50, flexDirection: 'column', display: 'flex', paddingRight: 50, justifyContent: 'space-around', height: 250}}>
                            <TextField id="standard-basic" label="Email" value={this.state.email} onChange={this.changeEmailHandler} />
                            <TextField id="standard-basic" label="Password" value={this.state.password} onChange={this.changePasswordHandler} type="password" />
                            <CardActions style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                            <Button color="primary" variant="contained" type="submit">
                              Login
                            </Button>
                        </CardActions>
                        </form>
                        <GoogleButton
                            type="light"
                            onClick={this.handleGoogleSignIn}
                        />
                        {/* This only works on Safari and iOS! */}
                        <Button onClick={this.handleAppleSignIn}>
                            Sign in with apple
                        </Button>

                        </CardContent>
                        
                    </Card>
                    <Button color="primary">
                        Not Registered?
                    </Button>
                    <div className='g-signin2'></div>
                </body>
            </div>
        )
    }
}

export default Login;