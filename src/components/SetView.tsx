import React from 'react';
import { TableContainer, Table, TableBody, TableCell, TableHead, TableRow, Paper } from '@mui/material';
import { DataGrid, GridToolbar, GridRowsProp, GridColDef } from '@mui/x-data-grid';
import TableChartIcon from '@mui/icons-material/TableChart';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import ModelTrainingIcon from '@mui/icons-material/ModelTraining';
import Delete from '@mui/icons-material/Delete';

import { StatusContext, contextType } from '../StatusContext';

import NewDataSet from './NewDataSet'

interface IDictionary<T> {
    [index:string]: T;
}

const ProfileGrid: React.FC<{dataSet: IDictionary<string>[]}> = ({dataSet}): JSX.Element => {

    // console.log("Dataset1:", dataSet);

    const columns: GridColDef[] = Object.keys(dataSet[0]).map((c) => {
        return { field: c, headerName: c, width: 150 };
    });

    // eslint-disable-next-line
    const rows: GridRowsProp[] = Object.entries(dataSet).map(([key, value]:[string, any]) => {
        return { id: key, ...value };
    });

    return <DataGrid autoHeight rows={rows} columns={columns} components={{ Toolbar: GridToolbar }} />;
}

// eslint-disable-next-line
const ModelGrid: React.FC<{selectedSet: string|null, columns: string[] | null}> = ({ selectedSet, columns}): JSX.Element => {
    return <div>Not implemented yet</div>
}

const SetView = (): JSX.Element => {

    const [dataSets, setDataSets] = React.useState<string[]>([]);
    const [dataHead, setDataHead] = React.useState<IDictionary<string>[] | null>(null);
    const [dataDesc, setDataDesc] = React.useState<IDictionary<string>[] | null>(null);
    const [dataCols, setDataCols] = React.useState<string[] | null>(null);
    const [barPlot, setBarPlot] = React.useState<string | null>(null);
    const [modelTraining, setModelTraining] = React.useState<boolean | null>(null);

    const [selectedDS, setSelectedDS] = React.useState<string | null>(null);

    const [error, setError] = React.useState<string|undefined>();
    const { token } = React.useContext<contextType>(StatusContext);

    // console.log("Token:", token);

    const fetchDatasets = React.useCallback(
        async () => {

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
        }, [token]
    );

    React.useEffect(() => {
        fetchDatasets();
    }, [fetchDatasets]);


    const resetState = () => {
        setDataHead(null);
        setDataDesc(null);
        setDataCols(null);
        setSelectedDS(null);
        setBarPlot(null);
        setModelTraining(null);
    }

    const handleProfile = async (dsName: string) => {
        // console.log("The Values that you wish to edit ", dsName);

        if (dataHead) {
            resetState();
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

    const handleFeSet = async (dsName: string) => {
        // console.log("Columns action:", dsName);

        if (dataCols) {
            resetState();
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

    const handlePlot = async (dsName: string) => {
        // console.log("Columns action:", dsName);

        if (barPlot) {
            resetState();
            return;
        }

        setSelectedDS(dsName);

        const url = `http://${window.location.hostname}:5000/datasets/${dsName}/graph`;
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
            if (resp?.imageBytes !== undefined) {
                setBarPlot(resp?.imageBytes);
            }
        } else {
            const excep = resp?.exception !== undefined ? ":" + resp["exception"] : "";
            setError(response.statusText + excep);
        }

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

    const handleModel = async (dsName: string) => {
        console.log("Model: " + dsName)

        if (modelTraining) {
            resetState();
            return;            
        }

        setModelTraining(true);

        // const url = `http://${window.location.hostname}:5000/datasets/${dsName}/delete`;
        // const options = {
        //     method: "GET",
        //     headers: {
        //         Accept: "application/json",
        //         "Content-Type": "application/json;charset=UTF-8",
        //         Authorization: 'Bearer ' + token
        //     }
        // };

        // const response = await fetch(url, options);
        // const resp = await response?.json();

        // // console.log("Resp:", resp);

        // if (response.ok) {
        //     fetchDatasets();
        // } else {
        //     const excep = resp?.exception !== undefined ? ":" + resp["exception"] : "";
        //     setError(response.statusText + excep);
        // }
    }

    return (
            error ? <div>{error}</div> :
                <TableContainer component={Paper}>
                    <Table sx={{minWidth: 650}}>
                        <TableHead sx={{backgroundColor: '#e3f2fd'}}>
                            <TableRow>
                                <TableCell>Existing Dataset Name</TableCell>
                                <TableCell>Delete</TableCell>
                                <TableCell>Profile</TableCell>
                                <TableCell>FE data set</TableCell>
                                <TableCell>Plot</TableCell>
                                <TableCell>Model Training</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            { dataSets.map(row => (
                                <TableRow key={row}>
                                    <TableCell component="th" scope="row">{row}</TableCell>
                                    <TableCell>
                                        <Delete onClick={() => handleDelete(row)} />
                                    </TableCell>
                                    <TableCell>
                                        <TableChartIcon onClick={() => handleProfile(row)} />
                                    </TableCell>
                                    <TableCell>
                                        <CreateNewFolderIcon onClick={() => handleFeSet(row)} />
                                    </TableCell>
                                    <TableCell>
                                        <AutoGraphIcon onClick={() => handlePlot(row)} />
                                    </TableCell>
                                    <TableCell>
                                        <ModelTrainingIcon onClick={() => handleModel(row)} />
                                    </TableCell>
                                </TableRow>
                            )) }
                        </TableBody>
                    </Table>
                    { dataHead && <ProfileGrid dataSet={dataHead}/> }
                    { dataDesc && <ProfileGrid dataSet={dataDesc}/> }
                    { dataCols && selectedDS && <NewDataSet selectedSet={selectedDS} columns={dataCols}/> }
                    { barPlot && <img src={`data:image/png;base64,${barPlot}`} alt="bar plot"/>}
                    { modelTraining && <ModelGrid selectedSet={selectedDS} columns={dataCols}/>}
                </TableContainer>
    )

}

export default SetView;