import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import { updatePassword } from 'firebase/auth';  // Correct import
import {
  Box,
  Typography,
  Avatar,
  Paper,
  Grid,
  Button,
  TextField,
  Modal,
  IconButton,
} from '@mui/material';
import QRCodeCanvas from 'qrcode.react';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';

const HostProfilePage = () => {
  const { currentUser } = useAuth();
  const [host, setHost] = useState(null);
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchHostData = async () => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const hostId = userDoc.data().hostId;
          if (hostId) {
            const hostDoc = await getDoc(doc(db, 'hosts', hostId));
            if (hostDoc.exists()) {
              setHost(hostDoc.data());
            }
          }
        }
      }
    };

    fetchHostData();
  }, [currentUser]);

  if (!host) {
    return <Typography>Loading...</Typography>;
  }

  const handlePrint = () => {
    window.print();
  };

  const handlePasswordChange = async () => {
    try {
      if (newPassword.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }

      await updatePassword(auth.currentUser, newPassword);
      setSuccess('Password updated successfully.');
      setPasswordModalOpen(false);
      setError('');
    } catch (error) {
      setError('Failed to update password.');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4} md={3}>
            <Avatar
              src={host.profilePicture}
              alt={host.name}
              sx={{ width: 150, height: 150, margin: '0 auto' }}
            />
          </Grid>
          <Grid item xs={12} sm={8} md={9}>
            <Typography variant="h4" gutterBottom>
              {host.name}
              <IconButton
                color="primary"
                onClick={() => setPasswordModalOpen(true)}
                sx={{ ml: 2 }}
              >
                <LockIcon />
              </IconButton>
            </Typography>
            <Typography variant="h6" gutterBottom>
              {host.position}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>ID No:</strong> {host.idNo}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>NID/Passport:</strong> {host.nidPassportNumber}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>WP/VISA:</strong> {host.wpVisaNumber}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Country:</strong> {host.country}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Zeyvaru Plus:</strong> {host.zeyvaruPlus}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Klevio:</strong> {host.klevio}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Status:</strong>{' '}
              <span style={{ color: host.status === 'Active' ? 'green' : 'red' }}>
                {host.status}
              </span>
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={handlePrint}
            >
              Print Digital ID
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
              Digital ID
            </Typography>
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              mt: 2,
              p: 3,
              border: '1px solid #ccc',
              borderRadius: '8px',
              background: '#f9f9f9'
            }}>
              <Avatar
                src={host.profilePicture}
                alt={host.name}
                sx={{ width: 120, height: 120, mb: 2, border: '2px solid #ccc' }}
              />
              <Typography variant="h6" gutterBottom>
                {host.name}
              </Typography>
              <QRCodeCanvas
                value={`https://ssr-host-verification-12d08.web.app/verify/${host.id}`}
                size={150}
                level={"H"}
                includeMargin={true}
              />
              <Typography variant="body2" sx={{ mt: 2 }}>
                Scan this QR code to verify the digital ID.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Modal
        open={isPasswordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 300,
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
          borderRadius: '8px',
        }}>
          <Typography variant="h6" gutterBottom>Change Password</Typography>
          <TextField
            fullWidth
            type="password"
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            sx={{ mt: 2, mb: 2 }}
          />
          {error && <Typography color="error">{error}</Typography>}
          {success && <Typography color="success">{success}</Typography>}
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handlePasswordChange}
          >
            Update Password
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default HostProfilePage;
