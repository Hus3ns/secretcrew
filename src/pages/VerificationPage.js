import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Box, Card, CardContent, Avatar, CircularProgress } from '@mui/material';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import logo from '../assets/logo.png'; // Add your brand logo here
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import Flag from 'react-world-flags';

const cardStyle = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  maxWidth: 600,
  margin: '0 auto',
  marginTop: '5%',
  padding: '20px',
  boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)',
  borderRadius: '10px',
  textAlign: 'left',
  backgroundColor: '#ffffff',
};

const VerificationPage = () => {
  const { id } = useParams();
  const [host, setHost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHost = async () => {
      try {
        const hostDoc = doc(db, 'hosts', id);
        const hostSnap = await getDoc(hostDoc);
        if (hostSnap.exists()) {
          setHost({ id: hostSnap.id, ...hostSnap.data() });
        } else {
          setHost(null);
        }
      } catch (error) {
        console.error('Error fetching host:', error);
        setHost(null);
      } finally {
        setLoading(false);
      }
    };

    fetchHost();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f0f0' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f0f0' }}>
      {host ? (
        <Card sx={cardStyle}>
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar alt="Logo" src={logo} sx={{ width: 100, height: 80, marginBottom: 2 }} />
            <Avatar src={host.profilePicture} alt={host.name} sx={{ width: 120, height: 120, mb: 2, border: '2px solid #ccc' }} />
          </Box>
          <CardContent sx={{ flex: 2 }}>
            <Typography variant="h5" gutterBottom sx={{ color: host.status === 'Active' ? '#935810' : 'red', fontWeight: 'bold' }}>
              {host.status === 'Active' ? 'Verified Host' : 'Unverified Host'}
            </Typography>
            <Typography variant="body1" sx={{ marginBottom: 1 }}>
              <strong>Host ID:</strong> {host.idNo}
            </Typography>
            <Typography variant="body1" sx={{ marginBottom: 1 }}>
              <strong>Name:</strong> {host.name}
            </Typography>
            <Typography variant="body1" sx={{ marginBottom: 1 }}>
              <strong>Position:</strong> {host.position}
            </Typography>
            <Typography variant="body1" sx={{ marginBottom: 1 }}>
              <strong>NID/Passport:</strong> {host.nidPassportNumber}
            </Typography>
            <Typography variant="body1" sx={{ marginBottom: 1 }}>
              <strong>WP/VISA:</strong> {host.wpVisaNumber}
            </Typography>
            <Typography variant="body1" sx={{ marginBottom: 1 }}>
              <strong>Country:</strong> 
              <Box sx={{ display: 'inline-flex', alignItems: 'center', ml: 1 }}>
                <Flag code={host.countryCode} style={{ width: '20px', marginRight: '8px' }} />
                {host.country}
              </Box>
            </Typography>
            <Typography variant="body1" sx={{ marginBottom: 1 }}>
              <strong>Status:</strong> 
              <Box sx={{ display: 'inline-flex', alignItems: 'center', ml: 1 }}>
                {host.status === 'Active' ? (
                  <CheckCircleIcon style={{ color: 'green', marginRight: '8px' }} />
                ) : (
                  <CancelIcon style={{ color: 'red', marginRight: '8px' }} />
                )}
                {host.status}
              </Box>
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, fontWeight: 'bold' }}>
              {host.category}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Typography variant="h6" color="red">
          Host not found or invalid QR code.
        </Typography>
      )}
    </Box>
  );
};

export default VerificationPage;
