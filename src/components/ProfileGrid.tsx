import React from 'react';
import { DataGrid, GridToolbar, GridRowsProp, GridColDef } from '@mui/x-data-grid';

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

export default ProfileGrid;