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

const ModelGrid: React.FC<{selectedSet: string|null, columns: string[] | null}> = ({ selectedSet, columns}): JSX.Element => {

    const models = ["Linear Regression"]

    const [model, setModel] = React.useState<string|undefined>(models ? models[0] : undefined);
    const [responseVar, setResponseVar] = React.useState<string|undefined>(columns ? columns[0] : undefined);

    const [kfold, setKfold] = React.useState<string>("3");
    const [standardScaling, setStandardScaling] = React.useState<boolean>(false);

    const [error, setError] = React.useState<string|undefined>()
    const [message, setMessage] = React.useState<string|undefined>()

    const { token } = React.useContext<contextType>(StatusContext);

    const selectResponseChange = (event: SelectChangeEvent) => {
        setModel(event.target.value);
    };

    const hangleStandardScaling = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setStandardScaling(event?.target?.value === "on");
    }

    const createClick = async () => {

        setError(undefined);
        setMessage(undefined);

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
                // console.log(resp);
                const message = resp?.msg !== undefined && resp["msg"];
                setMessage(message);
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

    return (
        <Grid container rowSpacing={1}>
            <Grid item xs={12}>
                <Item><h2>Model options</h2></Item>
            </Grid>
            <Grid item xs={6}>
                <Item><h2>Algorithm</h2></Item>
                <Select id="dropna" labelId='dropna' value={model} onChange={selectResponseChange} size="small">
                            { models?.map( (c, index) => {
                                return <MenuItem key={index} value={c}>{c}</MenuItem>;
                            })}
                </Select>
            </Grid>
            <Grid item xs={6}>
                <Item><h2>Response Variable</h2></Item>
                <Select id="dropna" labelId='dropna' value={responseVar} onChange={selectResponseChange} size="small">
                            { columns && columns?.map( (c, index) => {
                                return <MenuItem key={index} value={c}>{c}</MenuItem>;
                            })}
                </Select>
            </Grid>
            <Grid item xs={6}>
                <Item><h2>K-Fold Cross-Validation</h2></Item>
                <Select id="dropna" labelId='dropna' value={kfold} onChange={ (e) => setKfold(e?.target?.value)} size="small">
                            { ["3", "5", "10"].map( (c, index) => {
                                return <MenuItem key={index} value={c}>{c}</MenuItem>;
                            })}
                </Select>
                <Item>Standard Scaling
                    <Switch defaultChecked inputProps={{ 'aria-label': 'ant design' }} size="small" onChange={hangleStandardScaling}/>
                </Item>
                <Item>
                    <Button type="submit" onClick={createClick}>Fit Model</Button>
                </Item>
                {message && <Alert severity="info">{message}</Alert>}
                {error && <Alert severity="error">Processing error: {error}</Alert>}
            </Grid>
        </Grid>
    )
}

export default ModelGrid;