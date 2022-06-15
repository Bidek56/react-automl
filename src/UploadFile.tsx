import React, {useCallback} from 'react'
import {useDropzone} from 'react-dropzone'
import styled from 'styled-components';


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

  // const [uploadFile, { loading, error }] = useMutation(SINGLE_UPLOAD, {

  //   // update the cache
  //   update( cache, { data: {singleUpload}}) {
  //     const {uploads} = cache.readQuery( { query: GET_UPLOADS } );

  //     cache.writeQuery({
  //       query: GET_UPLOADS,
  //       data: { uploads: uploads.concat([singleUpload]) },
  //     });
  //   }   
  // });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Do something with the files
    acceptedFiles.forEach((file: File) => {
      console.log("Accepted:", file)
      // uploadFile({ variables: { file } });
    })
  }, [])
  const {getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject} = useDropzone({onDrop})

  // if (loading) return <div>Loading...</div>;
  // if (error)   return <div>{JSON.stringify(error, null, 2)}</div>;

  return (
      <Container {...getRootProps({isDragActive, isDragAccept, isDragReject})}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop some files here, or click to select files</p>
        <em>(Only *.csv files will be accepted)</em>
      </Container>
  )
};

export default UploadFile;
