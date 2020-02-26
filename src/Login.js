import React from 'react';
import firebase from "firebase/app";
import { Card, CardActions, CardContent, Button, Typography } from '@material-ui/core';
import red from '@material-ui/core/colors/red';
import logo from './Assets/fetch.png';
import GoogleButton from 'react-google-button';
import FacebookLogin from 'react-facebook-login';
import RenderInBrowser from 'react-render-in-browser';
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator';

const red300 = red['500'];

const errorStyle = {
    right: 0,
    fontSize: '16px',
    color: red300,
};
class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = { email: '', password: '', successfulSignIn: true }

        this.changeEmailHandler = this.changeEmailHandler.bind(this);
        this.changePasswordHandler = this.changePasswordHandler.bind(this);
        this.submitHandler = this.submitHandler.bind(this);
        this.handleGoogleSignIn = this.handleGoogleSignIn.bind(this);
        this.handleAppleSignIn = this.handleAppleSignIn.bind(this);
        this.handleFacebookSignIn = this.handleFacebookSignIn.bind(this);
    }

    submitHandler = async (event) => {
        event.preventDefault()
        firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password).catch((error) => {
            this.setState({
                successfulSignIn: false
            });
        });

    }

    changeEmailHandler = (event) => {
        this.setState({ email: event.target.value });
    }

    changePasswordHandler = (event) => {
        this.setState({ password: event.target.value });
    }

    handleGoogleSignIn = async (event) => {
        var googleProvider = new firebase.auth.GoogleAuthProvider();
        var result = await firebase.auth().signInWithPopup(googleProvider).catch((error) => {
            console.log(error.code);
        });

        console.log(result);
    }

    handleFacebookSignIn = async (event) => {
        var facebookProvider = new firebase.auth.FacebookAuthProvider();
        var result = await firebase.auth().signInWithPopup(facebookProvider).catch((error) => {
            console.log(error.code);
        });

        console.log(result);
    }

    handleAppleSignIn = async (event) => {
        var appleProvider = new firebase.auth.OAuthProvider('apple.com');
        var result = await firebase.auth().signInWithPopup(appleProvider).catch((error) => {
            console.log(error.code);
        });

        console.log(result);
    }

    render() {
        return (
            <div className="Login">
                <header style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 50 }}>
                    <img src={logo} alt="logo" />
                </header>
                <body style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <Card style={{ minWidth: 550, minHeight: 300, marginBottom: 25 }}>
                        <CardContent>
                            <Typography gutterBottom variant="h5" component="h2">
                                Login Info
                            </Typography>
                            <ValidatorForm
                                onSubmit={this.submitHandler}
                                instantValidate={false}
                                style={{ paddingLeft: 50, flexDirection: 'column', display: 'flex', paddingRight: 50, justifyContent: 'space-around', height: 250 }}
                            >
                                {!this.state.successfulSignIn ? <text style={errorStyle}>Incorrect Email/Password</text> : null}
                                <TextValidator id="standard-basic" label="Email" value={this.state.email} onChange={this.changeEmailHandler} validators={['required', 'isEmail']} errorMessages={['This field is required', 'Email is not valid']} />
                                <TextValidator id="standard-basic" label="Password" value={this.state.password} onChange={this.changePasswordHandler} type="password" validators={['required']} errorMessages={['This field is required']}/>
                                <CardActions style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <Button color="primary" variant="contained" type="submit">
                                        Login
                                    </Button>
                                </CardActions>
                            </ValidatorForm>
                            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginBottom: 25, marginTop: 50 }}>
                                <GoogleButton
                                    type="light"
                                    onClick={this.handleGoogleSignIn}
                                />
                                <FacebookLogin
                                    onClick={this.handleFacebookSignIn}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                <RenderInBrowser safari only>
                                    {/* This only works on Safari and iOS! */}
                                    <Button onClick={this.handleAppleSignIn} variant="contained">
                                        Sign in with apple
                                    </Button>
                                </RenderInBrowser>
                            </div>
                        </CardContent>

                    </Card>
                    <Button color="primary" onClick={this.handleRegisterClick}>
                        Create New Account with Email?
                    </Button>
                    <div className='g-signin2'></div>
                </body>
            </div>
        )
    }
}

export default Login;