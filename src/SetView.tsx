import React from 'react'
import { Button, TableContainer, Table, TableBody, TableCell, TableHead, TableRow, Paper } from '@mui/material';
import { DataGrid, GridToolbar, GridRowsProp, GridColDef } from '@mui/x-data-grid';


const ProfileGrid: React.FC<{dataSet: any}> = ({dataSet}): JSX.Element => {

    // console.log("Dataset:", dataSet);

    const columns: GridColDef[] = Object.keys(dataSet[0]).map((c) => {
        return { field: c, headerName: c, width: 150 };
    });

    const rows: GridRowsProp[] = Object.entries(dataSet).map(([key, value]:[string, any]) => {
        return { id: key, ...value };
    });

    return <DataGrid autoHeight rows={rows} columns={columns} components={{ Toolbar: GridToolbar }} />;
}

interface IDictionary<T> {
    [index:string]: T;
}

const SetView = (): JSX.Element => {

    const [dataSets, setDataSets] = React.useState<string[]>([]);
    const [dataSet, setDataSet] = React.useState<IDictionary<string> | null>(null);

    React.useEffect(() => {

        const fetchDatasets = async () => {
            const url = `http://${window.location.hostname}:5000/`;
            const options = {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json;charset=UTF-8",
                }
            };

            const response = await fetch(url, options);
            const resp = await response.json();
            // console.log(resp);
            setDataSets(resp);
        };

        fetchDatasets();

    }, []);

    const handleProfile = async (dsName: string) => {
        // console.log("The Values that you wish to edit ", dsName);

        if (dataSet) {
            setDataSet(null);
            return;
        }

        const url = `http://${window.location.hostname}:5000/datasets/${dsName}`;
        const options = {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json;charset=UTF-8",
            }
        };

        const response = await fetch(url, options);
        const resp = await response?.json();

        // console.log("Resp:", JSON.parse(resp));

        if (resp)
            setDataSet(JSON.parse(resp));
      };

    return (
        <TableContainer component={Paper}>
            <Table sx={{minWidth: 650}}>
                <TableHead sx={{backgroundColor: '#e3f2fd'}}>
                    <TableRow>
                        <TableCell>Data set</TableCell>
                        <TableCell align="left">Action</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    { dataSets.map(row => (
                        <TableRow key={row}>
                            <TableCell component="th" scope="row">
                                {row}
                            </TableCell>
                            <TableCell align="left">
                                <Button aria-label="edit" onClick={() => handleProfile(row)}>Profile</Button>
                            </TableCell>
                        </TableRow>
                    )) }
                </TableBody>
            </Table>
            { dataSet && <ProfileGrid dataSet={dataSet}/> }
        </TableContainer>
    )

}

export default SetView;