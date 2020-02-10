import React from 'react';
import { FirebaseAuthConsumer } from '@react-firebase/auth';

class Login extends React.Component {
    render() {
        return (
            <FirebaseAuthConsumer>
                {({ isSignedIn, user, providerId }) => {
                    return (
                        <pre style={{ height: 300, overflow: "auto" }}>
                            {JSON.stringify({ isSignedIn, user, providerId }, null, 2)}
                        </pre>
                    );
                }}
            </FirebaseAuthConsumer>
        )
    }
}

export default Login;