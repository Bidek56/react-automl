import React from 'react';
import { TableContainer, Table, TableBody, TableCell, TableHead, TableRow, Paper } from '@mui/material';
import TableChartIcon from '@mui/icons-material/TableChart';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import ModelTrainingIcon from '@mui/icons-material/ModelTraining';
import Delete from '@mui/icons-material/Delete';

import { StatusContext, contextType } from '../StatusContext';

import NewDataSet from './NewDataSet'
import ModelGrid from './ModelGrid'
import ProfileGrid from './ProfileGrid'

export interface IDictionary<T> {
    [index:string]: T;
}

const SetView = (): JSX.Element => {

    const [dataSets, setDataSets] = React.useState<string[]>([]);
    const [dataHead, setDataHead] = React.useState<IDictionary<string>[] | null>(null);
    const [dataDesc, setDataDesc] = React.useState<IDictionary<string>[] | null>(null);
    const [dataCols, setDataCols] = React.useState<string[] | null>(null);
    const [barPlot, setBarPlot] = React.useState<string | null>(null);
    const [fe, setFe] = React.useState<boolean>(false);
    const [modelTraining, setModelTraining] = React.useState<boolean>(false);

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
        setFe(false);
        setModelTraining(false);
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

        if (fe) {
            resetState();
            return;
        }

        setFe(true);

        // get DS columns
        await setColumns(dsName);
    }

    const setColumns = async (dsName: string) => {
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
        
        if (modelTraining) {
            resetState();
            return;            
        }

        if (!dsName)
            return

        // get DS columns
        await setColumns(dsName);

        setSelectedDS(dsName);
        setModelTraining(true);
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
                    { fe && dataCols && selectedDS && <NewDataSet selectedSet={selectedDS} columns={dataCols}/> }
                    { barPlot && <img src={`data:image/png;base64,${barPlot}`} alt="bar plot"/>}
                    { modelTraining && selectedDS && dataCols && <ModelGrid selectedSet={selectedDS} columns={dataCols}/>}
                </TableContainer>
    )

}

export default SetView;