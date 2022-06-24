import React from 'react';
import { styled } from '@mui/material/styles';
import { Button, TableContainer, Table, TableBody, TableCell, TableHead, TableRow, Paper, Grid, MenuItem } from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { DataGrid, GridToolbar, GridRowsProp, GridColDef } from '@mui/x-data-grid';
import TableChartIcon from '@mui/icons-material/TableChart';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';

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

const NewDataSet: React.FC<{columns: string[]}> = ({columns}): JSX.Element => {

    const handleChange = (event: SelectChangeEvent) => {
        // setAge(event.target.value);
      };

    return (
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Item><h2>Preprocessing options</h2></Item>
                </Grid>
                <Grid item xs={6}>
                    <Item><h3>Feature Selection</h3></Item>
                    <Item><h4>Automatic selection (Chi-squared)</h4></Item>
                    <Item>Number of Features (Chi-squared):</Item>
                    <Item>Response Variable:{columns}</Item>
                    <Item><h4>Manual Selection (Chi-squared)</h4></Item>
                    <Item>New Dataset Name:</Item>
                    <Item>Variables Selection:{columns}</Item>
                </Grid>
                <Grid item xs={6}>
                    <Item><h3>Null values and unique value variables</h3></Item>
                    <Item><h4>Drop rows with null values if...</h4>
                        <Select id="dropna" labelId='dropna' value="all" onChange={handleChange}>
                            <MenuItem value="all">Null in ALL columns</MenuItem>
                            <MenuItem value="any">Null in ANY column</MenuItem>
                            <MenuItem value="no">Never</MenuItem>
                        </Select>
                    </Item>
                    <Item>
                        <h4>Drop variables with a unique value</h4>
                        <Select id="dropsame" value="Yes" labelId="dropsame">
                            <MenuItem value="Yes">Yes</MenuItem>
                            <MenuItem value="No">No</MenuItem>
                        </Select>
                    </Item>

                    <Item>
                        <Button type="submit">Create New Dataset</Button>
                    </Item>
                </Grid>
            </Grid>
    )

}

const SetView = (): JSX.Element => {

    const [dataSets, setDataSets] = React.useState<string[]>([]);
    const [dataHead, setDataHead] = React.useState<IDictionary<string>[] | null>(null);
    const [dataDesc, setDataDesc] = React.useState<IDictionary<string>[] | null>(null);
    const [dataCols, setDataCols] = React.useState<string[] | null>(null);

    const [error, setError] = React.useState<string|undefined>();
    const { token } = React.useContext<contextType>(StatusContext);

    // console.log("Token:", token);

    React.useEffect(() => {
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

        fetchDatasets();
    }, [token]);

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

    const handleColumns = async (dsName: string) => {
        // console.log("Columns action:", dsName);

        if (dataCols) {
            setDataHead(null);
            setDataDesc(null);
            setDataCols(null);
            return;
        }

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

        // console.log("Resp:", resp);

        if (resp?.columns !== undefined) {
            setDataCols(resp['columns']);
        }
    };

    return (
            error ? <div>{error}</div> :
                <TableContainer component={Paper}>
                    <Table sx={{minWidth: 650}}>
                        <TableHead sx={{backgroundColor: '#e3f2fd'}}>
                            <TableRow>
                                <TableCell>Original data set</TableCell>
                                <TableCell align="left">Action</TableCell>
                                <TableCell align="left">Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            { dataSets.map(row => (
                                <TableRow key={row}>
                                    <TableCell component="th" scope="row">{row}</TableCell>
                                    <TableCell align="left">
                                        <Button aria-label="edit" onClick={() => handleProfile(row)} startIcon={<TableChartIcon />}>Profile</Button>
                                    </TableCell>
                                    <TableCell align="left">
                                        <Button aria-label="" onClick={() => handleColumns(row)} startIcon={<CreateNewFolderIcon />}>New data set</Button>
                                    </TableCell>
                                </TableRow>
                            )) }
                        </TableBody>
                    </Table>
                    { dataHead && <ProfileGrid dataSet={dataHead}/> }
                    { dataDesc && <ProfileGrid dataSet={dataDesc}/> }
                    { dataCols && <NewDataSet columns={dataCols}/> }
                </TableContainer>
    )

}

export default SetView;