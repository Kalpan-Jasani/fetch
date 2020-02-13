import React from 'react';
import { FirebaseAuthConsumer } from '@react-firebase/auth';
import { TextField, Card, CardActions, CardContent, Button, Typography } from '@material-ui/core';
import logo from './Assets/fetch.png'

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {email: '', password: ''}
    }

    submitHandler = (event) => {
        console.log(event);
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
                            <TextField id="standard-basic" label="Email" />
                            <TextField id="standard-basic" label="Password" />
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