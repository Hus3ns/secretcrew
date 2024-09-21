import React, { useState, useMemo } from 'react';
import { useHost } from '../../contexts/HostContext';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton,
  TableSortLabel, TablePagination, TextField, Snackbar, Alert, Box, Typography, Modal, Button, Avatar
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import QrCodeIcon from '@mui/icons-material/QrCode';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { QRCodeCanvas } from 'qrcode.react';
import FileManagerModal from './FileManagerModal';
import { visuallyHidden } from '@mui/utils';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import Flag from 'react-world-flags';
import DigitalIdTemplate from '../../assets/Digital_ID_Template_1.svg'; // Adjust the path accordingly
import DigitalIdTemplate1 from '../../assets/did_tmplt.jpg'; // Adjust the path accordingly

const headCells = [
  { id: 'profilePicture', numeric: false, disablePadding: false, label: 'Profile' },
  { id: 'category', numeric: false, disablePadding: false, label: 'Category' },
  { id: 'idNo', numeric: false, disablePadding: false, label: 'ID No.' },
  { id: 'name', numeric: false, disablePadding: false, label: 'Name' },
  { id: 'position', numeric: false, disablePadding: false, label: 'Position' },
  { id: 'nidPassportNumber', numeric: false, disablePadding: false, label: 'NID/Passport Number' },
  { id: 'wpVisaNumber', numeric: false, disablePadding: false, label: 'WP/VISA Number' },
  { id: 'gender', numeric: false, disablePadding: false, label: 'Gender' },
  { id: 'country', numeric: false, disablePadding: false, label: 'Country' },
  { id: 'zeyvaruPlus', numeric: false, disablePadding: false, label: 'Zeyvaru Plus' },
  { id: 'klevio', numeric: false, disablePadding: false, label: 'Klevio' },
  { id: 'hostDigitalId', numeric: false, disablePadding: false, label: 'Host Digital ID' },
  { id: 'status', numeric: false, disablePadding: false, label: 'Status' },
  { id: 'actions', numeric: false, disablePadding: false, label: 'Actions' },
];

const EnhancedTableHead = ({ order, orderBy, onRequestSort }) => {
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
              style={{ color: 'white' }}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

const HostTable = ({ onEdit }) => {
  const { hosts, deleteHost } = useHost();
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedHost, setSelectedHost] = useState(null);
  const [fileManagerOpen, setFileManagerOpen] = useState(false);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleQrCodeGenerate = (host) => {
    setSelectedHost(host);
    setQrModalOpen(true);
  };

  const handleQrModalClose = () => {
    setQrModalOpen(false);
    setSelectedHost(null);
  };

  const handleFileManager = (host) => {
    setSelectedHost(host);
    setFileManagerOpen(true);
  };

  const handleFileManagerClose = () => {
    setFileManagerOpen(false);
    setSelectedHost(null);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteHost = (hostId) => {
    deleteHost(hostId);
    setSnackbarMessage('Host deleted successfully');
    setSnackbarOpen(true);
  };

  const handleSearchQueryChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredHosts = useMemo(() => {
    return hosts.filter((host) =>
      (host.name && host.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (host.idNo && host.idNo.toString().toLowerCase().includes(searchQuery.toLowerCase())) // Convert to string before using toLowerCase()
    );
  }, [hosts, searchQuery]);

  const sortedHosts = useMemo(() => {
    return filteredHosts.sort((a, b) => {
      const valA = a[orderBy] ? a[orderBy].toString().toLowerCase() : '';
      const valB = b[orderBy] ? b[orderBy].toString().toLowerCase() : '';
      if (valA < valB) {
        return order === 'asc' ? -1 : 1;
      }
      if (valA > valB) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredHosts, order, orderBy]);

  const paginatedHosts = useMemo(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return sortedHosts.slice(startIndex, endIndex);
  }, [sortedHosts, page, rowsPerPage]);

  return (
    <Box sx={{ p: 2 }}>
      <TextField
        fullWidth
        margin="normal"
        variant="outlined"
        placeholder="Search by Name or ID No."
        value={searchQuery}
        onChange={handleSearchQueryChange}
        sx={{ marginBottom: 2 }}
      />
      <TableContainer component={Paper} sx={{ marginTop: '16px' }}>
        <Table>
          <EnhancedTableHead
            order={order}
            orderBy={orderBy}
            onRequestSort={handleRequestSort}
          />
          <TableBody>
            {paginatedHosts.map((host) => (
              <TableRow key={host.id}>
                <TableCell sx={{ padding: '8px' }}>
                  <Avatar src={host.profilePicture} alt={host.name} sx={{ width: 50, height: 50 }} />
                </TableCell>
                <TableCell sx={{ padding: '8px' }}>{host.category}</TableCell>
                <TableCell sx={{ padding: '8px' }}>{host.idNo}</TableCell>
                <TableCell sx={{ padding: '8px' }}>{host.name}</TableCell>
                <TableCell sx={{ padding: '8px' }}>{host.position}</TableCell>
                <TableCell sx={{ padding: '8px' }}>{host.nidPassportNumber}</TableCell>
                <TableCell sx={{ padding: '8px' }}>{host.wpVisaNumber}</TableCell>
                <TableCell sx={{ padding: '8px' }}>{host.gender}</TableCell>
                <TableCell sx={{ padding: '8px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Flag code={host.countryCode} style={{ width: '20px', marginRight: '8px' }} />
                    {host.country}
                  </Box>
                </TableCell>
                <TableCell sx={{ padding: '8px' }}>{host.zeyvaruPlus}</TableCell>
                <TableCell sx={{ padding: '8px' }}>{host.klevio}</TableCell>
                <TableCell sx={{ padding: '8px' }}>{host.hostDigitalId}</TableCell>
                <TableCell sx={{ padding: '8px' }}>
                  {host.status === 'Active' ? (
                    <CheckCircleIcon style={{ color: 'green' }} />
                  ) : (
                    <CancelIcon style={{ color: 'red' }} />
                  )}
                </TableCell>
                <TableCell sx={{ padding: '8px', whiteSpace: 'nowrap' }}>
                  <IconButton color="primary" onClick={() => onEdit(host)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="secondary" onClick={() => handleDeleteHost(host.id)}>
                    <DeleteIcon />
                  </IconButton>
                  <IconButton color="default" onClick={() => handleQrCodeGenerate(host)}>
                    <QrCodeIcon />
                  </IconButton>
                  <IconButton color="default" onClick={() => handleFileManager(host)}>
                    <CloudUploadIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={sortedHosts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      {selectedHost && (
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
            height: 700, // Adjust according to the template dimensions
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
              <Avatar src={selectedHost.profilePicture} alt={selectedHost.name} sx={{ width: 215, height: 215, border: '2px solid #ccc' }} />
            </Box>
            <Box sx={{
              position: 'absolute',
              top: '57%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              //bgcolor: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '8px',
              p: 1,
              textAlign: 'center',
              width: '98%'
            }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'inline-block', verticalAlign: 'middle' }}>
                {selectedHost.name}
              </Typography>
              <Typography variant="body1">
                {selectedHost.position}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{fontWeight: 'bold', position: 'absolute', top: '64%', left: '50%', transform: 'translate(-50%, -50%)' }}>
              {selectedHost.idNo}
            </Typography>
            <Box sx={{ position: 'absolute', top: '74%', left: '50%', transform: 'translate(-50%, -50%)' }}>
              <QRCodeCanvas
                value={`https://secretcrew-ssr24.web.app/verify/${selectedHost.id}`}
                size={100}
                level={"H"}
                includeMargin={true}
              />
            </Box>
            <Typography variant="body1" sx={{ position: 'absolute', top: '92%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: 'bold' }}>
              {selectedHost.category}
            </Typography>
            <Box sx={{ position: 'absolute', top: '86%', left: '50%', transform: 'translate(-50%, -50%)', width: '80%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 0 }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Klevio:</Typography>
                <Typography variant="caption">{selectedHost.klevio} | </Typography>
                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>| Zeyvaru:</Typography>
                <Typography variant="caption">{selectedHost.zeyvaruPlus}</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption">
                  {selectedHost.hostDigitalId}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Modal>
      )}
      {selectedHost && (
        <FileManagerModal
          open={fileManagerOpen}
          onClose={handleFileManagerClose}
          host={selectedHost}
          setSelectedHost={setSelectedHost}
        />
      )}
    </Box>
  );
};

export default HostTable;
