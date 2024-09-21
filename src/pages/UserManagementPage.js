// src/pages/UserManagementPage.js

import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TablePagination, IconButton, Avatar, Button, Modal, TextField, MenuItem, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, Snackbar, CircularProgress, Alert
} from '@mui/material';
import { collection, getDocs, setDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import { getAuth, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { deleteUser } from 'firebase/auth';
import DeleteIcon from '@mui/icons-material/Delete';
import LockIcon from '@mui/icons-material/Lock';
import AddIcon from '@mui/icons-material/Add';

const roles = ['admin', 'user', 'security'];

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [hosts, setHosts] = useState([]);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({ email: '', password: '', role: 'user', hostId: '' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });

  const auth = getAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersData = await Promise.all(querySnapshot.docs.map(async (userDoc) => {
          const userData = userDoc.data();
          let hostData = {};

          if (userData.hostId) {
            try {
              const hostRef = doc(db, 'hosts', userData.hostId);
              const hostDoc = await getDoc(hostRef);
              if (hostDoc.exists()) {
                hostData = hostDoc.data();
              }
            } catch (error) {
              console.error("Error fetching host data:", error);
            }
          }

          return {
            id: userDoc.id,
            ...userData,
            hostName: hostData.name || 'Unassigned',
            hostProfilePicture: hostData.profilePicture || '/default-avatar.png',
            hostIdNo: hostData.idNo || 'N/A',
          };
        }));
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchHosts = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'hosts'));
        setHosts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching hosts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    fetchHosts();
  }, []);

  const handleDeleteUser = async (id) => {
    try {
      setLoading(true);
      // Delete user from Firestore
      await deleteDoc(doc(db, 'users', id));

      // Delete user from Firebase Authentication
      const user = auth.currentUser;
      if (user && user.uid === id) {
        await deleteUser(user);
      } else {
        // Handle case where you need to delete a user not currently signed in
        console.error('Only the current authenticated user can be deleted.');
      }

      setUsers(users.filter((user) => user.id !== id));

      setSnackbar({ open: true, message: 'User deleted successfully!', severity: 'success' });
    } catch (error) {
      console.error('Error deleting user:', error);
      setSnackbar({ open: true, message: 'Failed to delete user.', severity: 'error' });
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleSetPassword = (user) => {
    setSelectedUser(user);
    setPasswordModalOpen(true);
  };

  const handlePasswordUpdate = async () => {
    try {
      await sendPasswordResetEmail(auth, selectedUser.email);
      setSnackbar({ open: true, message: 'Password reset email sent successfully!', severity: 'success' });
      setPasswordModalOpen(false);
    } catch (error) {
      console.error(error);
      setSnackbar({ open: true, message: 'Failed to send password reset email.', severity: 'error' });
    }
  };

  const handleAddUser = () => {
    setAddUserModalOpen(true);
  };

  const handleAddUserClose = () => {
    setAddUserModalOpen(false);
    setNewUser({ email: '', password: '', role: 'user', hostId: '' });
  };

  const handleAddUserSubmit = async () => {
    if (!newUser.email || !newUser.password || !newUser.role) {
      setSnackbar({ open: true, message: 'Please fill in all fields.', severity: 'warning' });
      return;
    }

    try {
      setLoading(true);
      const { email, password, role, hostId } = newUser;
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      await setDoc(doc(db, 'users', uid), {
        uid,
        email,
        role,
        hostId
      });
      setUsers([...users, {
        id: uid,
        email,
        role,
        hostId,
        hostName: hosts.find(host => host.id === hostId)?.name || 'Unassigned',
        hostProfilePicture: hosts.find(host => host.id === hostId)?.profilePicture || '/default-avatar.png',
        hostIdNo: hosts.find(host => host.id === hostId)?.idNo || 'N/A',
      }]);
      setSnackbar({ open: true, message: 'User added successfully!', severity: 'success' });
      handleAddUserClose();
    } catch (error) {
      console.error('Error adding user:', error);
      setSnackbar({ open: true, message: 'Error adding user: ' + error.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteDialogOpen = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>User Management</Typography>
      <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleAddUser} sx={{ mb: 2 }}>
        Add User
      </Button>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Profile Picture</TableCell>
                  <TableCell>Username</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Host Name</TableCell>
                  <TableCell>Host ID No</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Avatar src={user.hostProfilePicture} alt={user.hostName} />
                    </TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.hostName}</TableCell>
                    <TableCell>{user.hostIdNo}</TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleSetPassword(user)}>
                        <LockIcon />
                      </IconButton>
                      <IconButton color="secondary" onClick={() => handleDeleteDialogOpen(user)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={users.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>

          {/* Set Password Modal */}
          <Modal
            open={passwordModalOpen}
            onClose={() => setPasswordModalOpen(false)}
            aria-labelledby="password-modal-title"
            aria-describedby="password-modal-description"
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
              <Typography id="password-modal-title" variant="h6" sx={{ mb: 2 }}>Send Password Reset Email</Typography>
              <Typography sx={{ mb: 2 }}>An email will be sent to <strong>{selectedUser?.email}</strong> to reset their password.</Typography>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handlePasswordUpdate}
              >
                Send Password Reset Email
              </Button>
            </Box>
          </Modal>

          {/* Add User Modal */}
          <Modal
            open={addUserModalOpen}
            onClose={handleAddUserClose}
            aria-labelledby="add-user-modal-title"
            aria-describedby="add-user-modal-description"
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
              <Typography id="add-user-modal-title" variant="h6" sx={{ mb: 2 }}>Add New User</Typography>
              <TextField
                label="Email"
                fullWidth
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                sx={{ mb: 3 }}
                error={!newUser.email}
                helperText={!newUser.email ? 'Email is required' : ''}
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                sx={{ mb: 3 }}
                error={!newUser.password}
                helperText={!newUser.password ? 'Password is required' : ''}
              />
              <TextField
                label="Role"
                select
                fullWidth
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                sx={{ mb: 3 }}
              >
                {roles.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Assign Host"
                select
                fullWidth
                value={newUser.hostId}
                onChange={(e) => setNewUser({ ...newUser, hostId: e.target.value })}
                sx={{ mb: 3 }}
              >
                {hosts.map((host) => (
                  <MenuItem key={host.id} value={host.id}>
                    {host.name} ({host.idNo})
                  </MenuItem>
                ))}
              </TextField>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleAddUserSubmit}
              >
                Add User
              </Button>
            </Box>
          </Modal>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={deleteDialogOpen}
            onClose={handleDeleteDialogClose}
            aria-labelledby="delete-dialog-title"
            aria-describedby="delete-dialog-description"
            >
            <DialogTitle id="delete-dialog-title">Confirm Deletion</DialogTitle>
            <DialogContent>
                <DialogContentText id="delete-dialog-description">
                Are you sure you want to delete the user <strong>{selectedUser?.email}</strong>? This action cannot be undone.
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ padding: '16px', justifyContent: 'flex-end' }}>
                <Button onClick={handleDeleteDialogClose} variant="contained" color="primary">
                Cancel
                </Button>
                <Button
                onClick={() => handleDeleteUser(selectedUser.id)}
                variant="contained"
                color="secondary"
                sx={{ marginLeft: '8px' }}
                >
                Delete
                </Button>
            </DialogActions>
            </Dialog>

          {/* Snackbar for notifications */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
              {snackbar.message}
            </Alert>
          </Snackbar>
        </>
      )}
    </Box>
  );
};

export default UserManagementPage;
