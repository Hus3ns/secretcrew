// src/components/Host/BulkImportModal.js

import React, { useState } from 'react';
import { Modal, Box, Typography, Button, IconButton, Alert, Snackbar, LinearProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useHost } from '../../contexts/HostContext';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

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
};

const BulkImportModal = ({ open, onClose }) => {
  const { addHostBulk } = useHost();
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLoading(true);
      const reader = new FileReader();
      const fileType = file.type;

      reader.onload = async (event) => {
        const fileData = event.target.result;

        try {
          if (fileType === "text/csv") {
            Papa.parse(fileData, {
              header: true,
              complete: async (results) => {
                if (results.errors.length) {
                  setError("Error parsing CSV file.");
                } else {
                  await addHostBulk(results.data);
                  setSnackbarMessage("Hosts imported successfully.");
                  setSnackbarOpen(true);
                  onClose();
                }
              },
            });
          } else if (fileType.includes("excel") || fileType.includes("spreadsheetml")) {
            const workbook = XLSX.read(fileData, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

            const headers = worksheet[0];
            const rows = worksheet.slice(1);

            const data = rows.map((row) => {
              let obj = {};
              row.forEach((cell, index) => {
                obj[headers[index]] = cell;
              });
              return obj;
            });

            await addHostBulk(data);
            setSnackbarMessage("Hosts imported successfully.");
            setSnackbarOpen(true);
            onClose();
          } else {
            setError("Unsupported file format.");
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      if (fileType === "text/csv") {
        reader.readAsText(file);
      } else {
        reader.readAsBinaryString(file);
      }
    }
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Bulk Import Hosts
            </Typography>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          <Button
            variant="contained"
            component="label"
            sx={{ mt: 2 }}
          >
            Upload CSV/Excel
            <input
              type="file"
              hidden
              onChange={handleFileUpload}
            />
          </Button>
          {loading && <LinearProgress sx={{ mt: 2 }} />}
        </Box>
      </Modal>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default BulkImportModal;
