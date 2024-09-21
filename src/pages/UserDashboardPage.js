import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Grid, Avatar, Button, Modal, TextField } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useHost } from '../contexts/HostContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { getAuth, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { QRCodeCanvas } from 'qrcode.react';
import EditIcon from '@mui/icons-material/Edit';
import DigitalIdTemplate1 from '../assets/did_tmplt.jpg'; // Adjust the path accordingly

const UserDashboardPage = () => {
  const { currentUser } = useAuth();
  const { hosts } = useHost();
  const [currentHost, setCurrentHost] = useState(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');

  const auth = getAuth();

  useEffect(() => {
    const fetchHostData = async () => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const hostId = userDoc.data().hostId;
          const hostDoc = await getDoc(doc(db, 'hosts', hostId));
          if (hostDoc.exists()) {
            setCurrentHost(hostDoc.data());
          }
        }
      }
    };

    fetchHostData();
  }, [currentUser]);

  const handleQrModalOpen = () => setQrModalOpen(true);
  const handleQrModalClose = () => setQrModalOpen(false);

  const handlePasswordModalOpen = () => setPasswordModalOpen(true);
  const handlePasswordModalClose = () => setPasswordModalOpen(false);

  const handlePasswordChange = async () => {
    if (currentPassword && newPassword) {
      try {
        const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
        await reauthenticateWithCredential(currentUser, credential);
        await updatePassword(currentUser, newPassword);
        alert('Password updated successfully');
        setPasswordModalOpen(false);
      } catch (error) {
        alert(error.message);
      }
    } else {
      alert('Please enter your current and new password');
    }
  };

  if (!currentHost) {
    return <Typography>Loading your profile...</Typography>;
  }

  return (
    <Box sx={{ padding: 4, backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>Your Profile</Typography>
      <Grid container spacing={4}>
        {/* Profile Section */}
        <Grid item xs={12} md={4}>
          <Card sx={{ textAlign: 'center', p: 3, boxShadow: 3 }}>
            <CardContent>
              <Avatar
                src={currentHost.profilePicture || '/default-avatar.png'} // Fallback if no profile picture
                alt={currentHost.name}
                sx={{ width: 150, height: 150, margin: '0 auto', mb: 2 }}
              />
              <Typography variant="h5" fontWeight="bold" color="primary">{currentHost.name}</Typography>
              <Typography variant="subtitle1" color="textSecondary">{currentHost.position}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Host Information Section */}
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">Host Information</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={4}>
                  <Typography variant="body2" color="textSecondary">Host ID:</Typography>
                  <Typography variant="body1" fontWeight="medium">{currentHost.idNo}</Typography>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Typography variant="body2" color="textSecondary">NID/Passport:</Typography>
                  <Typography variant="body1" fontWeight="medium">{currentHost.nidPassportNumber}</Typography>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Typography variant="body2" color="textSecondary">WP/VISA:</Typography>
                  <Typography variant="body1" fontWeight="medium">{currentHost.wpVisaNumber}</Typography>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Typography variant="body2" color="textSecondary">Gender:</Typography>
                  <Typography variant="body1" fontWeight="medium">{currentHost.gender}</Typography>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Typography variant="body2" color="textSecondary">Country:</Typography>
                  <Typography variant="body1" fontWeight="medium">{currentHost.country}</Typography>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Typography variant="body2" color="textSecondary">Category:</Typography>
                  <Typography variant="body1" fontWeight="medium">{currentHost.category}</Typography>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Typography variant="body2" color="textSecondary">Klevio:</Typography>
                  <Typography variant="body1" fontWeight="medium">{currentHost.klevio}</Typography>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Typography variant="body2" color="textSecondary">Zeyvaru Plus:</Typography>
                  <Typography variant="body1" fontWeight="medium">{currentHost.zeyvaruPlus}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">Digital ID:</Typography>
                  <Typography variant="body1" fontWeight="medium">{currentHost.hostDigitalId}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Actions Section */}
        <Grid item xs={12}>
          <Card sx={{ textAlign: 'center', p: 3, boxShadow: 3 }}>
            <CardContent>
              <Button
                variant="contained"
                color="primary"
                sx={{ m: 1 }}
                startIcon={<EditIcon />}
                onClick={handlePasswordModalOpen}
              >
                Change Password
              </Button>
              <Button
                variant="contained"
                color="secondary"
                sx={{ m: 1 }}
                onClick={handleQrModalOpen}
              >
                Generate Digital ID
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* QR Code Modal */}
      <Modal
        open={qrModalOpen}
        onClose={handleQrModalClose}
        aria-labelledby="qr-code-modal-title"
        aria-describedby="qr-code-modal-description"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          height: 700,
          bgcolor: 'transparent',
          border: 'none',
          boxShadow: 24,
          p: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: '10px',
          overflow: 'hidden',
          background: `url(${DigitalIdTemplate1}) no-repeat center center`,
          backgroundSize: 'cover',
        }}>
          <Box sx={{ position: 'absolute', top: '35.9%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <Avatar src={currentHost.profilePicture || '/default-avatar.png'} alt={currentHost.name} sx={{ width: 215, height: 215, border: '2px solid #ccc' }} />
          </Box>
          <Box sx={{
            position: 'absolute',
            top: '57%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            borderRadius: '8px',
            p: 1,
            textAlign: 'center',
            width: '98%'
          }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'inline-block', verticalAlign: 'middle' }}>
              {currentHost.name}
            </Typography>
            <Typography variant="body1">
              {currentHost.position}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 'bold', position: 'absolute', top: '64%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            {currentHost.idNo}
          </Typography>
          <Box sx={{ position: 'absolute', top: '74%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <QRCodeCanvas
              value={`https://secretcrew-ssr24.web.app//verify/${currentHost.id}`}
              size={100}
              level={"H"}
              includeMargin={true}
            />
          </Box>
          <Typography variant="body1" sx={{ position: 'absolute', top: '92%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: 'bold' }}>
            {currentHost.category}
          </Typography>
          <Box sx={{ position: 'absolute', top: '86%', left: '50%', transform: 'translate(-50%, -50%)', width: '80%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 0 }}>
              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Klevio:</Typography>
              <Typography variant="caption">{currentHost.klevio} | </Typography>
              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>| Zeyvaru:</Typography>
              <Typography variant="caption">{currentHost.zeyvaruPlus}</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption">
                {currentHost.hostDigitalId}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* Password Change Modal */}
      <Modal
        open={passwordModalOpen}
        onClose={handlePasswordModalClose}
        aria-labelledby="change-password-modal-title"
        aria-describedby="change-password-modal-description"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'white',
          border: '1px solid #ccc',
          boxShadow: 24,
          p: 4,
          borderRadius: '8px'
        }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Change Password</Typography>
          <TextField
            label="Current Password"
            type="password"
            fullWidth
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            sx={{ mb: 3 }}
          />
          <TextField
            label="New Password"
            type="password"
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            sx={{ mb: 3 }}
          />
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

export default UserDashboardPage;
