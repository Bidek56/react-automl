import React from 'react'
import { StatusContext } from './StatusContext';
import NavBar from './components/NavBar'
import Login from './components/Login'
import UploadFile from './components/UploadFile'
import SetView from './components/SetView'

import useToken from './useToken'

const App = () => {

    const [running, setRunning] = React.useState<boolean>(false)
    const [userCount, setUserCount] = React.useState<number>(0)
    const [completedCount, setCompletedCount] = React.useState<number>(0)
    const [log, setLog] = React.useState<string|undefined>()

    const { token, removeToken, setToken } = useToken();

    const statusValue = React.useMemo(() => ({ token, running, setRunning, 
                                               userCount, setUserCount,
                                               completedCount, setCompletedCount,
                                               log, setLog
                                            }), [token, running, setRunning, userCount, setUserCount, completedCount, setCompletedCount, log, setLog, ]);

    const logout = async () => {

        const url = `http://${window.location.hostname}:5000/logout`;
        const options = {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json;charset=UTF-8",
                Authorization: 'Bearer ' + token
            }
        };

        const response = await fetch(url, options);

        // console.log("Logout res:", response)

        if (response.ok) {
            removeToken();
        }
    }

    // console.log("Token:", token);

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