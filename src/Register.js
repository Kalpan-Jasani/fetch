import React from 'react';
import firebase from "firebase/app";
import { TextField, Card, CardActions, CardContent, Button, Typography } from '@material-ui/core';
import logo from './Assets/fetch.png'

class Register extends React.Component {
    constructor(props) {
        super(props);
        this.state = {email: '', password: '', name: ''}

        this.changeEmailHandler = this.changeEmailHandler.bind(this);
        this.changePasswordHandler = this.changePasswordHandler.bind(this);
        this.submitHandler = this.submitHandler.bind(this);
    }

    submitHandler = async (event) => {
        var email, password = this.state
        event.preventDefault()
        firebase.auth().createUserWithEmailAndPassword(email, password).catch((error) => {
            console.log(error.code);
        })
        
    }

    changeEmailHandler = (event) => {
        this.setState({email: event.target.value})
    }

    changePasswordHandler = (event) => {
        this.setState({password: event.target.value})
    }

    changeNameHandler = (event) => {
        this.setState({name: event.target.value})
    }

    render() {
        return (
            <div className="Register">
                <header style={{display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 50}}>
                    <img src={logo} alt="logo" />
                </header>
                <body style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <Card style={{minWidth: 400, minHeight: 350, marginBottom: 25}}>
                        <CardContent>
                        <Typography gutterBottom variant="h5" component="h2">
                          Register for a New Account
                        </Typography>
                        <form 
                        onSubmit={this.submitHandler}
                        style={{paddingLeft: 25, flexDirection: 'column', display: 'flex', paddingRight: 25, justifyContent: 'space-around', height: 300}}>
                            <TextField id="standard-basic" label="Name" value={this.state.name} onChange={this.changeNameHandler} />
                            <TextField id="standard-basic" label="Email" value={this.state.email} onChange={this.changeEmailHandler} />
                            <TextField id="standard-basic" label="Password" value={this.state.password} onChange={this.changePasswordHandler} type="password" />
                            <CardActions style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                            <Button color="primary" variant="contained" type="submit">
                              Create Account
                            </Button>
                        </CardActions>
                        </form>
                        </CardContent>
                        
                    </Card>
                </body>
            </div>
        )
    }
}

export default Register;