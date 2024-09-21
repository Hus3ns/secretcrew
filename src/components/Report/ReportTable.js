import React from 'react';
import { useTable, useFilters, useSortBy, usePagination } from 'react-table';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, TablePagination } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  tableContainer: {
    maxHeight: 440,
    boxShadow: theme.shadows[5],
    borderRadius: theme.shape.borderRadius,
  },
  table: {
    minWidth: 650,
    backgroundColor: theme.palette.background.paper,
  },
  headerCell: {
    fontWeight: 'bold',
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
  },
  bodyRow: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    '&:hover': {
      backgroundColor: theme.palette.action.selected,
    },
  },
  pagination: {
    backgroundColor: theme.palette.background.paper,
  },
  cell: {
    padding: theme.spacing(1),
    textAlign: 'center',
    '&:first-child': {
      paddingLeft: theme.spacing(3),
    },
    '&:last-child': {
      paddingRight: theme.spacing(3),
    },
  },
}));

const ReportTable = ({ columns, data }) => {
  const classes = useStyles();
  const tableInstance = useTable({ columns, data }, useFilters, useSortBy, usePagination);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageOptions,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = tableInstance;

  return (
    <Paper>
      <TableContainer className={classes.tableContainer}>
        <Table {...getTableProps()} className={classes.table}>
          <TableHead>
            {headerGroups.map((headerGroup) => (
              <TableRow {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <TableCell
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    className={classes.headerCell}
                  >
                    {column.render('Header')}
                    <TableSortLabel
                      active={column.isSorted}
                      direction={column.isSortedDesc ? 'desc' : 'asc'}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody {...getTableBodyProps()}>
            {page.map((row) => {
              prepareRow(row);
              return (
                <TableRow {...row.getRowProps()} className={classes.bodyRow}>
                  {row.cells.map((cell) => (
                    <TableCell {...cell.getCellProps()} className={classes.cell}>
                      {cell.render('Cell')}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={data.length}
        page={pageIndex}
        onPageChange={(e, newPage) => gotoPage(newPage)}
        rowsPerPage={pageSize}
        onRowsPerPageChange={(e) => setPageSize(Number(e.target.value))}
        rowsPerPageOptions={[5, 10, 20]}
        className={classes.pagination}
      />
    </Paper>
  );
};

export default ReportTable;
