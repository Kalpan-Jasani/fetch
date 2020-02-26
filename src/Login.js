import React from 'react';
import firebase from "firebase/app";
import { TextField, Card, CardActions, CardContent, Button, Typography } from '@material-ui/core';
import logo from './Assets/fetch.png'

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {email: '', password: ''}

        this.changeEmailHandler = this.changeEmailHandler.bind(this);
        this.changePasswordHandler = this.changePasswordHandler.bind(this);
        this.submitHandler = this.submitHandler.bind(this);
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

    render() {
        return (
            <div className="Login">
                <header style={{display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 50}}>
                    <img src={logo} alt="logo" />
                </header>
                <body style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <Card style={{minWidth: 400, minHeight: 300, marginBottom: 25}}>
                        <CardContent>
                        <Typography gutterBottom variant="h5" component="h2">
                          Login Info
                        </Typography>
                        <form 
                        onSubmit={this.submitHandler}
                        style={{paddingLeft: 25, flexDirection: 'column', display: 'flex', paddingRight: 25, justifyContent: 'space-around', height: 250}}>
                            <TextField id="standard-basic" label="Email" value={this.state.email} onChange={this.changeEmailHandler} />
                            <TextField id="standard-basic" label="Password" value={this.state.password} onChange={this.changePasswordHandler} type="password" />
                            <CardActions style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                            <Button color="primary" variant="contained" type="submit">
                              Login
                            </Button>
                        </CardActions>
                        </form>
                        </CardContent>
                        
                    </Card>
                    <Button color="primary">
                        Not Registered?
                    </Button>
                </body>
            </div>
        )
    }
}

export default Login;