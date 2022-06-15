import React from 'react'
// import { io } from "socket.io-client";
import { StatusContext } from './StatusContext';
import NewTask from './NewTask'
import NavBar from './NavBar'
import Login from './Login'
import JobTableView from './JobView'

import useToken from './useToken'

interface IMessage {
    type: string;
    count: number;
    log?: string;
    log_content?: string;
    completed?: number;
    token?: string;
    user?: string;
    message?: string;
}

const App = () => {

    const [socket, setSocket] = React.useState<any|null>(null);
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

        const url = "http://localhost:5000/logout";
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

    const onReceiveMessage = ({ data }: { data: string; }) => {
        const obj: IMessage | null = JSON.parse(data);

        if (!obj)
            return

        // console.log("Msg rcvd:", obj)

        switch (obj.type) {
            case "state":
                if (obj?.completed) setCompletedCount(obj?.completed);
                setLog(obj?.log);
                setLogContent(obj?.log_content)
                break;
            case "users":
                // setUserCount(obj?.count);
                break;
            case "token":
                if (obj?.token) {
                    // setCookie("token", obj?.token, { maxAge: 3600, sameSite: 'strict'});
                    // if (obj?.user) setUser(obj?.user);
                    setLoginError(undefined)
                } else {
                    setLoginError("Token not found");
                }
                break;
            case "error":
                setLoginError(obj?.message);
                break;
            default:
                console.error("unsupported event", data);
        }
    };

    const onError = (data:any) => {
        console.error("WS error")
        setLoginError("Websocket error")
    }

    // React.useEffect(() => {

    //     const foo = async () => {
    //         try {
    //             const socket = io(`http://${window.location.hostname}:5000`);
    //             // const newSocket = io(`http://${window.location.hostname}:5000`, token && { query: { token } });
    //             setSocket(socket);

    //             // client-side
    //             socket.on("connect", () => {
    //                 console.log("Socket id:", socket.id); // x8WIv7-mJelg7on_ALbx
    //             });

    //             return () => socket.close();
    //         }
    //         catch(err: unknown) {
    //             if (err instanceof Error)
    //                 console.error("Error:", err.message);
    //         }
    //     }
    //     foo();
    //   }, [setSocket]);

    return (
            <StatusContext.Provider value={statusValue}>
                { token ?
                    <div>
                        <NavBar logout={logout} />
                        <br/>
                        <NewTask token={token}/>
                        <br/>
                        <JobTableView/>                        
                    </div> : <Login setToken={setToken} />
                }
            </StatusContext.Provider>
    )
}

export default App