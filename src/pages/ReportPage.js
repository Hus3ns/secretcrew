import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Box, Typography, Grid, Card, CardContent, Button, IconButton, TextField, InputAdornment } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { db } from '../firebase/firebase';
import ReportTable from '../components/Report/ReportTable';
import * as XLSX from 'xlsx';
import GetAppIcon from '@mui/icons-material/GetApp';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(4),
    backgroundColor: '#f5f5f5',
    minHeight: '100vh',
  },
  header: {
    marginBottom: theme.spacing(3),
    fontWeight: 'bold',
    color: theme.palette.primary.dark,
  },
  card: {
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
  },
  datePickerBox: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
    border: '1px solid #ccc',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: '#fff',
    padding: theme.spacing(1),
    '& .react-datepicker-wrapper': {
      width: '100%',
    },
    '& .react-datepicker__input-container input': {
      width: '100%',
      padding: theme.spacing(1),
      borderRadius: theme.shape.borderRadius,
      border: 'none',
      fontSize: '16px',
    },
  },
  datePickerInput: {
    padding: theme.spacing(1.5),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: '#f9f9f9',
    boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
    fontSize: '16px',
  },
  exportButton: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    padding: theme.spacing(1.5),
    fontWeight: 'bold',
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  deleteButton: {
    color: theme.palette.error.main,
  },
  datePickerIcon: {
    marginRight: theme.spacing(1),
    color: theme.palette.text.secondary,
  },
}));

const ReportPage = () => {
  const classes = useStyles();
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const q = query(
        collection(db, 'logs'),
        where('timestamp', '>=', startDate),
        where('timestamp', '<=', endDate)
      );
      const querySnapshot = await getDocs(q);
      const logsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        action: doc.data().action,
        timestamp: doc.data().timestamp,
        timestamp1: doc.data().timestamp,
        ...doc.data(),
      }));

      const enrichedLogs = await Promise.all(
        logsData.map(async (log) => {
          const hostDoc = await getDoc(doc(db, 'hosts', log.hostId));
          if (hostDoc.exists()) {
            const hostData = hostDoc.data();
            return {
              ...log,
              idNo: hostData.idNo,
              hostName: hostData.name,
              hostDesignation: hostData.position,
              profilePicture: hostData.profilePicture,
              nidPassportNumber: hostData.nidPassportNumber,
              wpVisaNumber: hostData.wpVisaNumber,
              gender: hostData.gender,
              country: hostData.country,
            };
          }
          return log;
        })
      );

      // Sort logs by timestamp in descending order
      enrichedLogs.sort((a, b) => b.timestamp.toDate() - a.timestamp.toDate());

      setLogs(enrichedLogs);
    };
    fetchData();
  }, [startDate, endDate]);

  const deleteLog = async (logId) => {
    await deleteDoc(doc(db, 'logs', logId));
    setLogs(logs.filter((log) => log.id !== logId));
  };

  const columns = React.useMemo(
    () => [
      {
        Header: 'Photo',
        accessor: 'profilePicture',
        Cell: ({ cell: { value } }) => (
          <img src={value} alt="profile" style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover' }} />
        ),
      },
      {
        Header: 'Host ID',
        accessor: 'idNo',
      },
      {
        Header: 'Host Name',
        accessor: 'hostName',
      },
      {
        Header: 'Host Designation',
        accessor: 'hostDesignation',
      },
      {
        Header: 'Entry / Exit',
        accessor: 'action',
      },
      {
        Header: 'Time',
        accessor: 'timestamp',
        Cell: ({ cell: { value } }) => new Intl.DateTimeFormat('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }).format(value.toDate()),
      },
      {
        Header: 'Date',
        accessor: 'timestamp1',
        Cell: ({ cell: { value } }) => new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: 'long',
          day: '2-digit'
        }).format(value.toDate())
      },
      {
        Header: 'NID/Passport',
        accessor: 'nidPassportNumber',
      },
      {
        Header: 'WP/VISA',
        accessor: 'wpVisaNumber',
      },
      {
        Header: 'Gender',
        accessor: 'gender',
      },
      {
        Header: 'Country',
        accessor: 'country',
      },
      {
        Header: 'Actions',
        accessor: 'actions',
        Cell: ({ row }) => (
          <IconButton
            color="secondary"
            className={classes.deleteButton}
            onClick={() => deleteLog(row.original.id)}
          >
            <DeleteIcon />
          </IconButton>
        ),
      }
    ],
    []
  );

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(logs);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Logs');
    XLSX.writeFile(workbook, 'logs.xlsx');
  };

  return (
    <Box className={classes.container}>
      <Typography variant="h4" className={classes.header}>
        Host Logs Report
      </Typography>
      <Card className={classes.card}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <Box className={classes.datePickerBox}>
                <CalendarTodayIcon className={classes.datePickerIcon} />
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  maxDate={new Date()}
                  customInput={<TextField variant="outlined" className={classes.datePickerInput} />}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box className={classes.datePickerBox}>
                <CalendarTodayIcon className={classes.datePickerIcon} />
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  maxDate={new Date()}
                  customInput={<TextField variant="outlined" className={classes.datePickerInput} />}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                onClick={exportToExcel}
                variant="contained"
                startIcon={<GetAppIcon />}
                className={classes.exportButton}
              >
                Export to Excel
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Card className={classes.card}>
        <CardContent>
          <ReportTable columns={columns} data={logs} />
        </CardContent>
      </Card>
    </Box>
  );
};

export default ReportPage;
