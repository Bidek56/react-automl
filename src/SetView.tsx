import React from 'react';
import { styled } from '@mui/material/styles';
import { Alert, Switch, Button, TableContainer, Table, TableBody, TableCell, TableHead, TableRow, Paper, Grid, MenuItem, TextField } from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { DataGrid, GridToolbar, GridRowsProp, GridColDef } from '@mui/x-data-grid';
import TableChartIcon from '@mui/icons-material/TableChart';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import Delete from '@mui/icons-material/Delete';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';

import { StatusContext, contextType } from './StatusContext';

interface IDictionary<T> {
    [index:string]: T;
}

const ProfileGrid: React.FC<{dataSet: IDictionary<string>[]}> = ({dataSet}): JSX.Element => {

    // console.log("Dataset1:", dataSet);

    const columns: GridColDef[] = Object.keys(dataSet[0]).map((c) => {
        return { field: c, headerName: c, width: 150 };
    });

    const rows: GridRowsProp[] = Object.entries(dataSet).map(([key, value]:[string, any]) => {
        return { id: key, ...value };
    });

    return <DataGrid autoHeight rows={rows} columns={columns} components={{ Toolbar: GridToolbar }} />;
}

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  }));

const NewDataSet: React.FC<{selectedSet: string|null, columns: string[]}> = ({ selectedSet, columns}): JSX.Element => {

    const [newSetName, setNewSetName] = React.useState<string|undefined>();
    const [featureCount, setFeatureCount] = React.useState<number|undefined>();
    const [responseVar, setResponseVar] = React.useState<string>(columns[0]);
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

        const url = `http://${window.location.hostname}:5000/datasets/${selectedSet}/preprocessed_dataset/`;

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
                            { columns.map( (c, index) => {
                                return <MenuItem key={index} value={c}>{c}</MenuItem>;
                            })}
                        </Select>
                        <TextField id="outlined-basic" label="Number of Features" variant="outlined" size='small' defaultValue={featureCount && featureCount} onChange={handleChangeFeature} />
                    </Item>
                    <Item>or Manual Variables Selection:
                        <List sx={{ width: '100%', maxWidth: 160, bgcolor: 'background.paper' }}>
                            {columns.map((value) => {
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

const SetView = (): JSX.Element => {

    const [dataSets, setDataSets] = React.useState<string[]>([]);
    const [dataHead, setDataHead] = React.useState<IDictionary<string>[] | null>(null);
    const [dataDesc, setDataDesc] = React.useState<IDictionary<string>[] | null>(null);
    const [dataCols, setDataCols] = React.useState<string[] | null>(null);

    const [selectedDS, setSelectedDS] = React.useState<string | null>(null);

    const [error, setError] = React.useState<string|undefined>();
    const { token } = React.useContext<contextType>(StatusContext);

    // console.log("Token:", token);

    React.useEffect(() => {
        fetchDatasets();
    }, [token]);

    const fetchDatasets = async () => {

        const url = `http://${window.location.hostname}:5000/`;
        const options = {
            method: "GET",
            headers: {
                Authorization: 'Bearer ' + token
            }
        };

        const response = await fetch(url, options);

        // console.log("Resp:", response);

        const resp = await response.json();
        // console.log(resp);

        if (response.ok) {
            setDataSets(resp);
        } else {
            const excep = resp?.exception !== undefined ? ":" + resp["exception"] : "";
            setError(response.statusText + excep);
        }
    };

    const handleProfile = async (dsName: string) => {
        // console.log("The Values that you wish to edit ", dsName);

        if (dataHead) {
            setDataHead(null);
            setDataDesc(null);
            setDataCols(null);
            return;
        }

        const url = `http://${window.location.hostname}:5000/datasets/${dsName}`;
        const options = {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json;charset=UTF-8",
                Authorization: 'Bearer ' + token
            }
        };

        const response = await fetch(url, options);
        const resp = await response?.json();

        // console.log("Resp:", resp);

        // console.log("Resp:", JSON.parse(resp));
        // console.log("Keys:", Object.keys(resp).length);

        if (resp && Object.keys(resp).length === 2) {
            // console.log("Keys:", Object.keys(resp));
            setDataHead(JSON.parse(resp['head']));
            setDataDesc(JSON.parse(resp['desc']));
        }
    };

    const handleNewSet = async (dsName: string) => {
        // console.log("Columns action:", dsName);

        if (dataCols) {
            setDataHead(null);
            setDataDesc(null);
            setDataCols(null);
            setSelectedDS(null);
            return;
        }

        setSelectedDS(dsName);

        const url = `http://${window.location.hostname}:5000/datasets/${dsName}/columns`;
        const options = {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json;charset=UTF-8",
                Authorization: 'Bearer ' + token
            }
        };

        const response = await fetch(url, options);
        const resp = await response?.json();

        // console.log("Resp:", JSON.parse(resp['columns']));

        if (resp?.columns !== undefined) {
            setDataCols(JSON.parse(resp['columns']));
        }

        fetchDatasets();
    };

    const handleDelete = async (dsName: string) => {
        // console.log("Delete: " + dsName)

        const url = `http://${window.location.hostname}:5000/datasets/${dsName}/delete`;
        const options = {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json;charset=UTF-8",
                Authorization: 'Bearer ' + token
            }
        };

        const response = await fetch(url, options);
        const resp = await response?.json();

        // console.log("Resp:", resp);

        if (response.ok) {
            fetchDatasets();
        } else {
            const excep = resp?.exception !== undefined ? ":" + resp["exception"] : "";
            setError(response.statusText + excep);
        }
    }

    return (
            error ? <div>{error}</div> :
                <TableContainer component={Paper}>
                    <Table sx={{minWidth: 650}}>
                        <TableHead sx={{backgroundColor: '#e3f2fd'}}>
                            <TableRow>
                                <TableCell>Dataset Path and Name</TableCell>
                                <TableCell align="left">Delete</TableCell>
                                <TableCell align="left">Profile</TableCell>
                                <TableCell align="left">New data set</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            { dataSets.map(row => (
                                <TableRow key={row}>
                                    <TableCell component="th" scope="row">{row}</TableCell>
                                    <TableCell align="left">
                                        <Delete onClick={() => handleDelete(row)} />
                                    </TableCell>
                                    <TableCell align="left">
                                        <TableChartIcon onClick={() => handleProfile(row)} />
                                    </TableCell>
                                    <TableCell align="left">
                                        <CreateNewFolderIcon onClick={() => handleNewSet(row)} />
                                    </TableCell>
                                </TableRow>
                            )) }
                        </TableBody>
                    </Table>
                    { dataHead && <ProfileGrid dataSet={dataHead}/> }
                    { dataDesc && <ProfileGrid dataSet={dataDesc}/> }
                    { dataCols && selectedDS && <NewDataSet selectedSet={selectedDS} columns={dataCols}/> }
                </TableContainer>
    )

}

export default SetView;