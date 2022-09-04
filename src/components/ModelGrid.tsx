import React from 'react';
import { styled } from '@mui/material/styles';
import { Alert, Switch, Button, Grid, MenuItem, Paper } from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { StatusContext, contextType } from '../StatusContext';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));

const ModelGrid: React.FC<{selectedSet: string|null, columns: string[] | null}> = ({selectedSet, columns}): JSX.Element => {

    const regModels = ["Linear Regression", "Random Forests Regression", "K Nearest Neighbors Regression", "AdaBoost Regression", "X Gradient Boosting Regression", "MultiLayer Perceptron Regression"]
    const clsModels = ["Logistic Classification", "Random Forests Classification", "K Nearest Neighbors Classification", "AdaBoost Classification", "X Gradient Boosting Classification", "MultiLayer Perceptron Classification"]

    const [model, setModel] = React.useState<string|undefined>(regModels ? regModels[0] : undefined);
    const [responseVar, setResponseVar] = React.useState<string|undefined>(columns ? columns[0] : undefined);

    const [kfold, setKfold] = React.useState<string>("2");
    const [standardScaling, setStandardScaling] = React.useState<boolean>(false);

    const [modelResp, setModelResp] = React.useState<Record<string, string> | undefined>();
    const [error, setError] = React.useState<string|undefined>()
    const [message, setMessage] = React.useState<string|undefined>()

    const { token } = React.useContext<contextType>(StatusContext);

    const selectModelChange = (event: SelectChangeEvent) => {
        setModel(event.target.value);
    };

    const selectResponseChange = (event: SelectChangeEvent) => {
        setResponseVar(event.target.value);
    };

    const hangleStandardScaling = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setStandardScaling(event?.target?.value === "on");
    }

    const createClick = async () => {

        setError(undefined);
        setMessage(undefined);
        setModelResp(undefined);

        const url = `http://${window.location.hostname}:5000/datasets/${selectedSet}/modelprocess/`;

        const options = {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json;charset=UTF-8",
                "Access-Control-Allow-Origin": "http://localhost:3000",
                "Access-Control-Allow-Credentials": "true",
                Authorization: 'Bearer ' + token
            },
            body: JSON.stringify({ 
                response: responseVar,
                model: model,
                kfold: kfold,
                scaling: standardScaling
            }),
        };

        try {
            const response = await fetch(url, options);

            // console.log(response);

            const resp = await response.json();

            if(response.ok) {
                console.log(resp);
                setModelResp(resp);
            } else {
                const excep = resp?.exception !== undefined && resp["exception"];
                setError(excep)
                console.error(resp);
            }
        } catch(err)  {
            console.log(err);
            setError(err + ":" + url);
        }
    }
    
    if (!selectedSet) {
        return <div>Data set not selected</div>
    }

    const allowed = ['alg', 'kfold', 'predictors', 'res'];

    return (
        <Grid container rowSpacing={1}>
            <Grid item xs={12}>
                <Item><h3>Model options for {selectedSet}</h3></Item>
            </Grid>
            <Grid item xs={3}>
                <Item>Algorithm :
                    <Select id="dropna" labelId='dropna' value={model} onChange={selectModelChange} size="small">
                                { regModels.concat(clsModels)?.map( (c, index) => {
                                    return <MenuItem key={index} value={c}>{c}</MenuItem>;
                                })}
                    </Select>
                </Item>
            </Grid>
            <Grid item xs={3}>
                <Item>Response Variable :
                    <Select id="dropna" labelId='dropna' value={responseVar} onChange={selectResponseChange} size="small">
                                { columns && columns?.map( (c, index) => {
                                    return <MenuItem key={index} value={c}>{c}</MenuItem>;
                                })}
                    </Select>
                </Item>
            </Grid>
            <Grid item xs={3}>
                <Item>K-Fold Cross-Validation
                    <Select id="dropna" labelId='dropna' value={kfold} onChange={ (e) => setKfold(e?.target?.value)} size="small">
                                { ["2","3", "5", "10"].map( (c, index) => {
                                    return <MenuItem key={index} value={c}>{c}</MenuItem>;
                                })}
                    </Select>
                </Item>
            </Grid>
            <Grid item xs={2}>
                <Item>Standard Scaling
                    <Switch defaultChecked inputProps={{ 'aria-label': 'ant design' }} size="small" onChange={hangleStandardScaling}/>
                </Item>
            </Grid>
            <Grid item xs={1}>
                <Item>
                    <Button type="submit" onClick={createClick}>Fit Model</Button>
                </Item>
            </Grid>
            {message && <Alert severity="info">{message}</Alert>}
            {error && <Alert severity="error">Processing error: {error}</Alert>}
            {modelResp && 
                <div>
                    {
                        Object.entries(modelResp)
                        .filter(([key]) => allowed.includes(key))
                        .map(([key, value]:[string, string]) => {
                            // console.log("K:", key, " val:", value);
                            return <h3>{key} {value}</h3>
                        })
                    }
                    <img src={`data:image/png;base64,${modelResp.figure}`} alt="bar plot"/>
                </div>
            }
        </Grid>
    )
}

export default ModelGrid;