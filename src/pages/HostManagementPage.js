import React, { useState } from 'react';
import HostTable from '../components/Host/HostTable';
import AddHostModal from '../components/Host/AddHostModal';
import BulkImportModal from '../components/Host/BulkImportModal'; // Import the BulkImportModal
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const HostManagementPage = () => {
  const [openAddHost, setOpenAddHost] = useState(false);
  const [openBulkImport, setOpenBulkImport] = useState(false); // State for BulkImportModal
  const [currentHost, setCurrentHost] = useState(null);

  const handleOpenAddHost = () => setOpenAddHost(true);
  const handleCloseAddHost = () => {
    setOpenAddHost(false);
    setCurrentHost(null);
  };

  const handleOpenBulkImport = () => setOpenBulkImport(true); // Open BulkImportModal
  const handleCloseBulkImport = () => setOpenBulkImport(false); // Close BulkImportModal

  const handleEdit = (host) => {
    setCurrentHost(host);
    setOpenAddHost(true);
  };

  return (
    <Box sx={{ padding: '16px' }}>
      <Typography variant="h4" gutterBottom>
        Host Management
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
        <Button variant="contained" color="primary" onClick={handleOpenAddHost}>
          Add Host
        </Button>
        <Button variant="contained" color="primary" onClick={handleOpenBulkImport}>
          Import Bulk Data
        </Button>
      </Box>
      <AddHostModal open={openAddHost} onClose={handleCloseAddHost} currentHost={currentHost} />
      <BulkImportModal open={openBulkImport} onClose={handleCloseBulkImport} /> {/* Add BulkImportModal */}
      <HostTable onEdit={handleEdit} />
    </Box>
  );
};

export default HostManagementPage;
