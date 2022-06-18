import React from 'react'
import {useDropzone} from 'react-dropzone'
import { Alert } from '@mui/material';
import styled from 'styled-components';
import { StatusContext, contextType } from './StatusContext';

const getColor = (props:any) => {
  if (props.isDragAccept) {
      return '#00e676';
  }
  if (props.isDragReject) {
      return '#ff1744';
  }
  if (props.isDragActive) {
      return '#2196f3';
  }
  return '#eeeeee';
}

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border-width: 2px;
  border-radius: 2px;
  border-color: ${props => getColor(props)};
  border-style: dashed;
  background-color: #fafafa;
  color: #bdbdbd;
  outline: none;
  transition: border .24s ease-in-out;
`;

const UploadFile = () : JSX.Element => {

  const { token } = React.useContext<contextType>(StatusContext);
  const [ error, setError ] = React.useState<string|undefined>();

  const upload = async (file: File) => {

    if (!file) {
      return
    }

    const data = new FormData();
    data.append('file', file);

    const url = `http://${window.location.hostname}:5000/uploader`;
    const options = {
        method: "POST",
        headers: { 
          Authorization: 'Bearer ' + token
        },
        body: data
    };

    const response = await fetch(url, options);
    
    // console.log("Resp:", response);

    const resp = await response?.json();
    
    // console.log("Resp:", resp);

    if (resp["msg"] === "file uploaded successfully") {

    } else if (resp["msg"] === "file not found") {
      setError(resp["msg"]);
    }
  }
  
  const onDrop = (acceptedFiles: File[]) => {  
    // Do something with the files
    acceptedFiles.forEach((file: File) => {
      upload(file);
    })
  }

  const {getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject} = useDropzone({onDrop})
  
  if (error) return <Alert severity="error">Upload error: {error}</Alert>;

  return (
      <Container {...getRootProps({isDragActive, isDragAccept, isDragReject})}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop some files here, or click to select files</p>
        <em>(Only *.csv files will be accepted)</em>
      </Container>
  )
};

export default UploadFile;
