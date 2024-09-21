import React, { useState } from 'react';
import { Modal, Box, Typography, Button, List, ListItem, ListItemText, IconButton, Avatar, CircularProgress, Snackbar, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useHost } from '../../contexts/HostContext';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 600,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const FileManagerModal = ({ open, onClose, host, setSelectedHost }) => {
  const { deleteFile, updateHost } = useHost();
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleDeleteFile = async (file) => {
    setLoading(true);
    try {
      await deleteFile(file.url);
      const updatedFiles = host.files.filter(f => f.url !== file.url);
      const updatedHost = { ...host, files: updatedFiles };
      await updateHost(host.id, updatedHost);
      setSelectedHost(updatedHost);
      setSnackbarMessage('File deleted successfully.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error deleting file:", error);
      setSnackbarMessage('Error deleting file.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfilePicture = async () => {
    if (host.profilePicture) {
      setLoading(true);
      try {
        await deleteFile(host.profilePicture);
        const updatedHost = { ...host, profilePicture: null };
        await updateHost(host.id, updatedHost);
        setSelectedHost(updatedHost);
        setSnackbarMessage('Profile picture deleted successfully.');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        window.location.reload(); // Refresh the page to reflect changes
      } catch (error) {
        console.error("Error deleting profile picture:", error);
        setSnackbarMessage('Error deleting profile picture.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="file-manager-modal-title"
      aria-describedby="file-manager-modal-description"
    >
      <Box sx={style}>
        <Typography id="file-manager-modal-title" variant="h6" component="h2" sx={{ marginBottom: 2 }}>
          File Manager
        </Typography>
        {loading && <CircularProgress sx={{ mb: 2 }} />}
        {host.profilePicture && (
          <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
            <Avatar src={host.profilePicture} alt="Profile Picture" sx={{ width: 50, height: 50, marginRight: 2 }} />
            <Button variant="contained" color="secondary" onClick={handleDeleteProfilePicture}>
              Delete Profile Picture
            </Button>
          </Box>
        )}
        <List sx={{ width: '100%' }}>
          {host.files.map((file) => (
            <ListItem key={file.url} secondaryAction={
              <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteFile(file)}>
                <DeleteIcon />
              </IconButton>
            }>
              <ListItemText primary={file.name} />
            </ListItem>
          ))}
        </List>
        <Button onClick={onClose} variant="contained" sx={{ mt: 2 }}>
          Close
        </Button>
        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
          <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Modal>
  );
};

export default FileManagerModal;
