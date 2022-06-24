import React from 'react'
import { Button, TableContainer, Table, TableBody, TableCell, TableHead, TableRow, Paper } from '@mui/material';
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

const NewDataSet: React.FC<{columns: string[]}> = ({columns}): JSX.Element => {

    return (
        <div>
            <h3>Choose preprocessing options</h3>
            <h3>Feature Selection</h3>
            <h3>Null values and unique value variables</h3>
            <div key="cols">{columns}</div>
        </div>
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
                setError(response.statusText + ":" + resp["exception"]);
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