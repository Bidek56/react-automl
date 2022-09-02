import React from 'react';
import { styled } from '@mui/material/styles';
import { Alert, Switch, Button, Grid, MenuItem, TextField, Paper } from '@mui/material';
import { Checkbox, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import { StatusContext, contextType } from '../StatusContext';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));


const NewDataSet: React.FC<{selectedSet: string|null, columns: string[] | null}> = ({ selectedSet, columns}): JSX.Element => {

    const [newSetName, setNewSetName] = React.useState<string|undefined>();
    const [featureCount, setFeatureCount] = React.useState<number|undefined>();
    const [responseVar, setResponseVar] = React.useState<string|undefined>(columns ? columns[0] : undefined);
    const [dropNull, setDropNull] = React.useState<string>("all");
    const [dropUnique, setDropUnique] = React.useState<boolean>(true);

    const [checked, setChecked] = React.useState<string[]>([]);

    const [error, setError] = React.useState<string|undefined>()
    const [message, setMessage] = React.useState<string|undefined>()

    const { token } = React.useContext<contextType>(StatusContext);

    const handleToggle = (value: string) => () => {
      const currentIndex = checked.indexOf(value);
      const newChecked = [...checked];
  
      if (currentIndex === -1) {
        newChecked.push(value);
      } else {
        newChecked.splice(currentIndex, 1);
      }
  
      setChecked(newChecked);
    };

    const selectResponseChange = (event: SelectChangeEvent) => {
        setResponseVar(event.target.value);
    };

    const dropNullChange = (event: SelectChangeEvent) => {
        setDropNull(event.target.value);
    };

    const handleChangeFeature = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFeatureCount(parseInt(event?.target?.value));
    };

    const handleChangeName = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setNewSetName(event?.target?.value);
    };

    const hangleChangeDropUnique = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setDropUnique(event?.target?.value === "on");
    }

    const createClick = async () => {

        if (!newSetName) {
            setMessage(undefined);
            setError("New data set name is not set");
            return
        }

        setError(undefined);
        setMessage(undefined);

        const url = `http://${window.location.hostname}:5000/datasets/${selectedSet}/preprocessed/`;

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
                dropna: dropNull, 
                dropsame: dropUnique, 
                response: responseVar,
                newdataset: newSetName,
                nfeatures: featureCount,
                manualfeatures: checked
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

    return (
            <Grid container rowSpacing={1}>
                <Grid item xs={12}>
                    <Item><h2>Preprocessing options</h2></Item>
                </Grid>
                <Grid item xs={6}>
                    <Item><h3>Feature Selection</h3></Item>
                    <Item><h4>Automatic selection (Chi-squared)</h4></Item>
                    <Item>
                    Response Variable:
                        <Select id="dropna" labelId='dropna' value={responseVar} onChange={selectResponseChange} size="small">
                            { columns && columns?.map( (c, index) => {
                                return <MenuItem key={index} value={c}>{c}</MenuItem>;
                            })}
                        </Select>
                        <TextField id="outlined-basic" label="Number of Features" variant="outlined" size='small' defaultValue={featureCount && featureCount} onChange={handleChangeFeature} />
                    </Item>
                    <Item>or Manual Variables Selection:
                        <List sx={{ width: '100%', maxWidth: 160, bgcolor: 'background.paper' }}>
                            {columns && columns.map((value) => {
                                const labelId = `checkbox-list-label-${value}`;

                                return (
                                    <ListItem key={value} disablePadding>
                                        <ListItemButton role={undefined} onClick={handleToggle(value)} dense>
                                        <ListItemIcon>
                                            <Checkbox
                                                edge="start"
                                                checked={checked.indexOf(value) !== -1}
                                                tabIndex={-1}
                                                disableRipple
                                                inputProps={{ 'aria-labelledby': labelId }}
                                                />
                                        </ListItemIcon>
                                            <ListItemText id={labelId} primary={value} />
                                        </ListItemButton>
                                    </ListItem>
                                    );
                                })}
                        </List>
                    </Item>
                </Grid>
                <Grid item xs={6}>
                    <Item><h3>Null values and unique value variables</h3></Item>
                    <Item>Drop rows with null values if...
                        <Select id="dropNull" labelId='dropNull' value={dropNull} size="small" onChange={dropNullChange}>
                            <MenuItem value="all">Null in ALL columns</MenuItem>
                            <MenuItem value="any">Null in ANY column</MenuItem>
                            <MenuItem value="no">Never</MenuItem>
                        </Select>
                    </Item>
                    <Item>Drop variables with a unique value
                        <Switch defaultChecked inputProps={{ 'aria-label': 'ant design' }} size="small" onChange={hangleChangeDropUnique}/>
                    </Item>
                    <Item>
                        <TextField id="outlined-basic" label="New Dataset Name" variant="outlined" size='small' defaultValue={newSetName} onChange={handleChangeName} />
                        <Button type="submit" onClick={createClick}>Create Dataset</Button>
                    </Item>
                    {message && <Alert severity="info">{message}</Alert>}
                    {error && <Alert severity="error">Processing error: {error}</Alert>}
                </Grid>
            </Grid>
    )

}

export default NewDataSet;