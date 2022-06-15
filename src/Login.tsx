import React from 'react'
import PropTypes from 'prop-types'
import { Alert, Avatar, Button, Container, Box, CssBaseline, TextField, Typography, Link } from '@mui/material';
import { LockOutlined } from '@mui/icons-material';

type LoginProps = { setToken: (username: string | null) => void, }

function Copyright() {
    return (
        <Typography variant="body2" color="textSecondary" align="center">
            {'Copyright © '}
            <Link color="inherit" href="https://reactjs.org/">React</Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}
 
const Login = ({ setToken }: LoginProps ) => {

    const userRef = React.useRef<string>('');
    const passRef = React.useRef<string>('');
    const [loginError, setLoginError] = React.useState<string|undefined>()

    const logMeIn = async () => {

        const url = `http://${window.location.hostname}:5000/token`;
        const options = {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json;charset=UTF-8",
            },
            body: JSON.stringify({ user: userRef?.current, pass: passRef?.current }),
        };

        const response = await fetch(url, options);

        // console.log(response)

        const resp = await response.json();

        if(response.ok) {
            // console.log(resp);
            setToken(resp["access_token"]);
        } else {
            setLoginError(resp["msg"]);
        }
    }

    const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!userRef?.current) {
            console.log('Missing user')
            alert('Missing user')
            setToken(null)
            return
        }

        if (!passRef?.current) {
            console.log('Missing password')
            alert('Error: Missing password')
            setToken(null)
            return
        }

        logMeIn()
    }

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Avatar>
                    <LockOutlined />
                </Avatar>
                <Typography component="h1" variant="h5">Sign in</Typography>
                <form id="loginForm" noValidate onSubmit={handleSignIn}>
                    <TextField id="userInput" variant="outlined" margin="normal" required fullWidth
                        label="User name" name="user" autoComplete="user" autoFocus onChange={e => userRef.current = e.target.value} />
                    <TextField id="passwordInput" variant="outlined" margin="normal" required fullWidth name="password"
                        label="Password" type="password" autoComplete="current-password" onChange={e => passRef.current = e.target.value} />
                    <Button id="signButton" type="submit" fullWidth variant="contained" color="primary">Sign in</Button>                    
                </form>
                {loginError && <Alert severity="error">Login error: {loginError}</Alert>}
            </div>
            <Box mt={8}>
                <Copyright />
            </Box>
        </Container>
    );
}

Login.propTypes = {
    setToken: PropTypes.func.isRequired
}

export default Login;