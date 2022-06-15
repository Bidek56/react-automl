import React from 'react'
import { StatusContext } from './StatusContext';
import NavBar from './NavBar'
import Login from './Login'
import UploadFile from './UploadFile'
import SetView from './SetView'

import useToken from './useToken'

const App = () => {

    const [socket] = React.useState<any|null>(null);
    const [running, setRunning] = React.useState<boolean>(false)
    const [userCount, setUserCount] = React.useState<number>(0)
    const [completedCount, setCompletedCount] = React.useState<number>(0)
    const [log, setLog] = React.useState<string|undefined>()
    const [logContent, setLogContent] = React.useState<string|undefined>()
    const [loginError, setLoginError] = React.useState<string|undefined>()

    const statusValue = React.useMemo(() => ({ socket, running, setRunning, 
                                               userCount, setUserCount,
                                               completedCount, setCompletedCount,
                                               log, setLog, logContent, loginError
                                            }), [socket, running, setRunning, userCount, setUserCount, completedCount, setCompletedCount, log, setLog, logContent, loginError]);

    const { token, removeToken, setToken } = useToken();

    const logout = async () => {

        const url = `http://${window.location.hostname}:5000/logout`;
        const options = {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json;charset=UTF-8",
            }
        };

        const response = await fetch(url, options);

        console.log(response)

        if(response.ok) {
            removeToken();
        }
    }

    return (
            <StatusContext.Provider value={statusValue}>
                { token ?
                    <div>
                        <NavBar logout={logout} />
                        <br/>
                        <UploadFile/>
                        <br/>
                        <SetView/>                        
                    </div> : <Login setToken={setToken} />
                }
            </StatusContext.Provider>
    )
}

export default App