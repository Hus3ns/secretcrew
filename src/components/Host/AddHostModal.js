import React, { useState, useEffect } from 'react';
import { useHost } from '../../contexts/HostContext';
import { Modal, Box, Typography, TextField, Button, MenuItem, Switch, FormControlLabel, Alert } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { v4 as uuidv4 } from 'uuid';
import { countries } from 'countries-list';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 600, // Adjust the max-width for responsiveness
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const categories = [
  "Host", "Helper", "Visitor", "Government Official", "Dependent",
  "Projects", "Soneva Fushi", "Soneva Jani", "Soneva Kiri", "HUB",
  "Supplier", "Service Provider"
];

const countryList = Object.values(countries).map(country => country.name);

const AddHostModal = ({ open, onClose, currentHost }) => {
  const { addHost, updateHost } = useHost();
  const [hostDetails, setHostDetails] = useState({
    name: '',
    category: '',
    idNo: '',
    position: '',
    nidPassportNumber: '',
    wpVisaNumber: '',
    gender: '',
    country: '',
    status: 'Active',
    profilePicture: null,
    files: [],
    zeyvaruPlus: '',
    klevio: '',
    hostDigitalId: '' // Assuming this is a new field
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentHost) {
      setHostDetails({
        ...currentHost,
        profilePicture: null, // Do not preload profile picture for edit, unless explicitly changed
        files: currentHost.files || [],
        zeyvaruPlus: currentHost.zeyvaruPlus || '',
        klevio: currentHost.klevio || '',
        hostDigitalId: currentHost.hostDigitalId || ''
      });
    } else {
      setHostDetails({
        name: '',
        category: '',
        idNo: '',
        position: '',
        nidPassportNumber: '',
        wpVisaNumber: '',
        gender: '',
        country: '',
        status: 'Active',
        profilePicture: null,
        files: [],
        zeyvaruPlus: '',
        klevio: '',
        hostDigitalId: ''
      });
    }
  }, [currentHost]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setHostDetails(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleStatusChange = (e) => {
    setHostDetails(prevState => ({
      ...prevState,
      status: e.target.checked ? 'Active' : 'Inactive'
    }));
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files).map(file => ({
      id: uuidv4(),
      name: file.name,
      file,
    }));
    setHostDetails(prevState => ({
      ...prevState,
      files: [...prevState.files, ...newFiles]
    }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setHostDetails(prevState => ({
        ...prevState,
        profilePicture: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updateData = { ...hostDetails };

      // If profilePicture is null, it means the user did not select a new picture, so don't update it
      if (!hostDetails.profilePicture) {
        delete updateData.profilePicture; // Prevent profile picture from being sent as `null`
      }

      if (currentHost) {
        if (hostDetails.profilePicture) {
          await updateHost(currentHost.id, updateData);
        } else {
          delete updateData.profilePicture; // Ensure existing profile picture stays if none is provided
          await updateHost(currentHost.id, updateData);
        }
      } else {
        await addHost(updateData);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style} component="form" onSubmit={handleSubmit}>
        <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ marginBottom: 2 }}>
          {currentHost ? 'Edit Host' : 'Add Host'}
        </Typography>
        {error && <Alert severity="error" sx={{ marginBottom: 2 }}>{error}</Alert>}
        <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 2, width: '100%' }}>
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            name="name"
            value={hostDetails.name}
            onChange={handleInputChange}
            required
            sx={{ flex: 1, minWidth: '45%' }}
          />
          <TextField
            select
            label="Category"
            fullWidth
            margin="normal"
            name="category"
            value={hostDetails.category}
            onChange={handleInputChange}
            required
            sx={{ flex: 1, minWidth: '45%' }}
          >
            {categories.map((category, index) => (
              <MenuItem key={index} value={category}>
                {category}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="ID No."
            fullWidth
            margin="normal"
            name="idNo"
            value={hostDetails.idNo}
            onChange={handleInputChange}
            required
            sx={{ flex: 1, minWidth: '45%' }}
          />
          <TextField
            label="Position"
            fullWidth
            margin="normal"
            name="position"
            value={hostDetails.position}
            onChange={handleInputChange}
            sx={{ flex: 1, minWidth: '45%' }}
          />
          <TextField
            label="NID/Passport Number"
            fullWidth
            margin="normal"
            name="nidPassportNumber"
            value={hostDetails.nidPassportNumber}
            onChange={handleInputChange}
            sx={{ flex: 1, minWidth: '45%' }}
          />
          <TextField
            label="WP/VISA Number"
            fullWidth
            margin="normal"
            name="wpVisaNumber"
            value={hostDetails.wpVisaNumber}
            onChange={handleInputChange}
            sx={{ flex: 1, minWidth: '45%' }}
          />
          <TextField
            label="Gender"
            fullWidth
            margin="normal"
            name="gender"
            value={hostDetails.gender}
            onChange={handleInputChange}
            sx={{ flex: 1, minWidth: '45%' }}
          />
          <TextField
            select
            label="Country"
            fullWidth
            margin="normal"
            name="country"
            value={hostDetails.country?.toLowerCase()} // Normalize the case for comparison
            onChange={handleInputChange}
            sx={{ flex: 1, minWidth: '45%' }}
          >
            {countryList.map((country, index) => (
              <MenuItem key={index} value={country.toLowerCase()}>
                {country}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Zeyvaru Plus"
            fullWidth
            margin="normal"
            name="zeyvaruPlus"
            value={hostDetails.zeyvaruPlus}
            onChange={handleInputChange}
            sx={{ flex: 1, minWidth: '45%' }}
          />
          <TextField
            label="Klevio"
            fullWidth
            margin="normal"
            name="klevio"
            value={hostDetails.klevio}
            onChange={handleInputChange}
            sx={{ flex: 1, minWidth: '45%' }}
          />
          <TextField
            label="Host Digital ID"
            fullWidth
            margin="normal"
            name="hostDigitalId"
            value={hostDetails.hostDigitalId}
            onChange={handleInputChange}
            sx={{ flex: 1, minWidth: '45%' }}
          />
        </Box>
        <FormControlLabel
          control={
            <Switch
              checked={hostDetails.status === 'Active'}
              onChange={handleStatusChange}
              name="status"
            />
          }
          label="Active"
          sx={{ marginTop: 2 }}
        />
        <Button
          variant="contained"
          component="label"
          startIcon={<CloudUploadIcon />}
          fullWidth
          sx={{ marginTop: 2 }}
        >
          Upload Profile Picture
          <input
            type="file"
            hidden
            onChange={handleProfilePictureChange}
          />
        </Button>
        <Button
          variant="contained"
          component="label"
          startIcon={<CloudUploadIcon />}
          fullWidth
          sx={{ marginTop: 2 }}
        >
          Upload Files
          <input
            type="file"
            hidden
            multiple
            onChange={handleFileChange}
          />
        </Button>
        <Box sx={{ marginTop: 2, width: '100%' }}>
          {hostDetails.files.map((file) => (
            <Typography key={file.id}>{file.name}</Typography>
          ))}
        </Box>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ marginTop: 2 }}
        >
          {currentHost ? 'Update Host' : 'Add Host'}
        </Button>
      </Box>
    </Modal>
  );
};

export default AddHostModal;
