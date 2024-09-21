import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Grid, List, ListItem, ListItemText, ListItemAvatar, Avatar } from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useHost } from '../contexts/HostContext';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import HistoryIcon from '@mui/icons-material/History';

const DashboardPage = () => {
  const { hosts } = useHost();
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const fetchRecentActivities = async () => {
      const querySnapshot = await getDocs(collection(db, 'logs'));
      const activities = querySnapshot.docs.map((doc) => doc.data()).slice(0, 5); // Get the 5 most recent activities

      const enrichedActivities = await Promise.all(activities.map(async (activity) => {
        const hostDoc = await getDocs(collection(db, 'hosts'));
        const host = hostDoc.docs.find((doc) => doc.id === activity.hostId)?.data();
        return { ...activity, host };
      }));

      setRecentActivities(enrichedActivities);
    };

    fetchRecentActivities();
  }, []);

  const activeHosts = hosts.filter(host => host.status === 'Active').length;
  const inactiveHosts = hosts.length - activeHosts;

  return (
    <Box sx={{ padding: 4, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ backgroundColor: 'primary.light', color: 'primary.contrastText' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <PeopleIcon sx={{ fontSize: 50, color: 'primary.contrastText', marginRight: 3 }} />
              <Box>
                <Typography variant="h6">Total Hosts</Typography>
                <Typography variant="h4">{hosts.length}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ backgroundColor: 'success.light', color: 'success.contrastText' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <PersonIcon sx={{ fontSize: 50, color: 'success.contrastText', marginRight: 3 }} />
              <Box>
                <Typography variant="h6">Active Hosts</Typography>
                <Typography variant="h4">{activeHosts}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ backgroundColor: 'error.light', color: 'error.contrastText' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <PersonOffIcon sx={{ fontSize: 50, color: 'error.contrastText', marginRight: 3 }} />
              <Box>
                <Typography variant="h6">Inactive Hosts</Typography>
                <Typography variant="h4">{inactiveHosts}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={12}>
          <Card sx={{ backgroundColor: 'secondary.light', color: 'secondary.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                <HistoryIcon sx={{ fontSize: 50, color: 'secondary.contrastText', marginRight: 3 }} />
                <Typography variant="h6">Recent Activity</Typography>
              </Box>
              <List>
                {recentActivities.map((activity, index) => (
                  <ListItem key={index}>
                    <ListItemAvatar>
                      <Avatar src={activity.host?.profilePicture} alt={activity.host?.name} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${activity.host?.name} - ${activity.action}`}
                      secondary={`Host ID: ${activity.hostId} - ${new Date(activity.timestamp.toDate()).toLocaleString()}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
