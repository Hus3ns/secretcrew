// src/components/Host/AddHost.js

import React, { useState } from 'react';
import { useHost } from '../../contexts/HostContext';
import { styled } from '@mui/system';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { v4 as uuidv4 } from 'uuid';

const FormContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  width: '100%',
  maxWidth: '500px',
  margin: '0 auto',
});

const FileUploadContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

const AddHost = () => {
  const { addHost } = useHost();
  const [name, setName] = useState('');
  const [passportId, setPassportId] = useState('');
  const [dob, setDob] = useState('');
  const [passportExpiry, setPassportExpiry] = useState('');
  const [medicalInsurance, setMedicalInsurance] = useState('');
  const [files, setFiles] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    addHost({
      name,
      passportId,
      dob,
      passportExpiry,
      medicalInsurance,
      status: 'Active',
      resort: 'SSR',
      files,
    });
    setName('');
    setPassportId('');
    setDob('');
    setPassportExpiry('');
    setMedicalInsurance('');
    setFiles([]);
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files).map(file => ({
      id: uuidv4(),
      name: file.name,
      file,
    }));
    setFiles(prevFiles => [...prevFiles, ...newFiles]);
  };

  return (
    <FormContainer component="form" onSubmit={handleSubmit}>
      <Typography variant="h6">Add Host</Typography>
      <TextField
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <TextField
        label="Passport ID"
        value={passportId}
        onChange={(e) => setPassportId(e.target.value)}
        required
      />
      <TextField
        label="Date of Birth"
        type="date"
        value={dob}
        onChange={(e) => setDob(e.target.value)}
        InputLabelProps={{
          shrink: true,
        }}
        required
      />
      <TextField
        label="Passport Expiry"
        type="date"
value={passportExpiry}
onChange={(e) => setPassportExpiry(e.target.value)}
InputLabelProps={{
shrink: true,
}}
required
/>
<TextField
label="Medical Insurance Details"
value={medicalInsurance}
onChange={(e) => setMedicalInsurance(e.target.value)}
required
/>
<FileUploadContainer>
<Button
variant="contained"
component="label"
startIcon={<CloudUploadIcon />}
>
Upload Files
<input
         type="file"
         hidden
         multiple
         onChange={handleFileChange}
       />
</Button>
<Box>
{files.map((file) => (
<Typography key={file.id}>{file.name}</Typography>
))}
</Box>
</FileUploadContainer>
<Button type="submit" variant="contained" color="primary">
Add Host
</Button>
</FormContainer>
);
};

export default AddHost;
