import React from 'react'
import { StatusContext, contextType } from './StatusContext';
import { Button, TableContainer, Table, TableBody, TableCell, TableHead, TableRow, Paper, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { Assignment } from '@mui/icons-material';

// Dialog related items
import { DialogProps } from '@mui/material/Dialog';


const ScrollDialog: React.FC<{ path: string, logContent: string|undefined }> = ({ path, logContent }) => {

    const [open, setOpen] = React.useState(false);
    const [scroll, setScroll] = React.useState<DialogProps['scroll']>('paper');

    const descriptionElementRef = React.useRef<HTMLElement>(null);
    React.useEffect(() => {
        const { current: descriptionElement } = descriptionElementRef;
        if (descriptionElement !== null) {
            descriptionElement.focus();
        }
    }, [open]);

    const handleClickOpen = (scrollType: DialogProps['scroll']) => () => {
        setOpen(true);
        setScroll(scrollType);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <div>
            <Button variant="contained" color="primary" endIcon={<Assignment />} onClick={handleClickOpen('paper')}>Show Log</Button>
            <Dialog
                open={open}
                onClose={handleClose}
                scroll={scroll}
                aria-labelledby="scroll-dialog-title"
                aria-describedby="scroll-dialog-description"
                maxWidth='lg'
            >
                <DialogTitle id="scroll-dialog-title">Log for: {path}</DialogTitle>
                <DialogContent dividers={scroll === 'paper'}>
                    <DialogContentText
                        id="scroll-dialog-description"
                        ref={descriptionElementRef}
                        tabIndex={-1}
                        style={{ whiteSpace: 'pre-line' }}
                    >
                        {logContent}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary">Close</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

const SetView = (): JSX.Element => {

    const { userCount, completedCount, log, logContent } = React.useContext<contextType>(StatusContext);

    const [dataSets, setDataSets] = React.useState<string[]>([]);
    const [profile, setProfile] = React.useState<any>();

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

            console.log(resp);

            setDataSets(resp);
        };

        fetchDatasets();

    }, []);

    const handleProfile = async (dsName: string) => {
        console.log("The Values that you wish to edit ", dsName);

        const url = `http://${window.location.hostname}:5000/datasets/${dsName}`;
        const options = {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json;charset=UTF-8",
            }
        };

        const response = await fetch(url, options);

        const resp = await response.json();

        // if ('exception' in resp){
            console.log(resp);
        // }

        setProfile(resp);
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

            { profile &&
            <Table sx={{minWidth: 650}}>

            </Table> }
        </TableContainer>
    )

}

export default SetView;