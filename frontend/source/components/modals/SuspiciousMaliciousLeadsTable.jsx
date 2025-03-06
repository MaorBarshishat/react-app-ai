import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

function createData(email, type, from, to, activity, suspicion) {
  return {
    email,
    type,
    from,
    to,
    activity,
    suspicion,
    history: generateRandomHistory(),
  };
}

function generateRandomHistory() {
  const actions = [
    'Account opening request',
    'User data updated',
    'Account registered for user',
    'POST login',
    'Logged login',
    'POST Product selected',
  ];

  const historyLength = Math.floor(Math.random() * 5) + 1; // Random number of history entries
  const history = [];

  for (let i = 0; i < historyLength; i++) {
    const time = new Date(Date.now() - Math.random() * 1000000000).toLocaleString();
    const timeDiff = Math.floor(Math.random() * 1800) + ' sec';
    const action = actions[Math.floor(Math.random() * actions.length)];
    const additionalInfo = `Information about ${action}`;

    history.push({ time, timeDiff, action, additionalInfo });
  }

  return history;
}

function Row(props) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } ,
                  cursor: 'pointer','&:hover': { backgroundColor: '#f0f0f0' }}}
                   onClick={handleToggle} style={{ cursor: 'pointer' }}>
        <TableCell>
          <IconButton aria-label="expand row" size="small">
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">{row.email}</TableCell>
        <TableCell align="left">{row.type}</TableCell>
        <TableCell align="left">{row.from}</TableCell>
        <TableCell align="left">{row.to}</TableCell>
        <TableCell align="left">{row.activity}</TableCell>
        <TableCell align="left">{row.suspicion}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                History
              </Typography>
              <Table size="small" aria-label="history">
                <TableHead>
                  <TableRow>
                    <TableCell>Time</TableCell>
                    <TableCell>Time Diff</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Additional Information</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.history.map((historyRow, index) => (
                    <TableRow key={index}>
                      <TableCell>{historyRow.time}</TableCell>
                      <TableCell>{historyRow.timeDiff}</TableCell>
                      <TableCell>{historyRow.action}</TableCell>
                      <TableCell>{historyRow.additionalInfo}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

Row.propTypes = {
  row: PropTypes.shape({
    email: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    from: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
    activity: PropTypes.string.isRequired,
    suspicion: PropTypes.string.isRequired,
    history: PropTypes.arrayOf(
      PropTypes.shape({
        time: PropTypes.string.isRequired,
        timeDiff: PropTypes.string.isRequired,
        action: PropTypes.string.isRequired,
        additionalInfo: PropTypes.string.isRequired,
      }),
    ).isRequired,
  }).isRequired,
};

// Initial Data
const initialRows = [
  createData('begdi1933@gmail.com', 'user', '11/28/24 08:15', '11/30/24 12:33', 'Login, Carts, In Store Browsing', 'User belongs to suspicious “fraud ring 103”'),
  createData('softov7767@gmail.com', 'user', '11/28/24 11:44', '11/29/24 18:14', 'Login, Carts, In Store Browsing, Reviews', 'User belongs to suspicious “fraud ring 103”'),
];

// Add 60 random rows
for (let i = 0; i < 60; i++) {
  const email = `user${Math.floor(Math.random() * 10000)}@gmail.com`;
  const type = ['user', 'admin', 'guest'][Math.floor(Math.random() * 3)];
  const from = `11/${Math.floor(Math.random() * 12) + 1}/24 ${Math.floor(Math.random() * 24)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
  const to = `11/${Math.floor(Math.random() * 12) + 1}/24 ${Math.floor(Math.random() * 24)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
  const activity = 'Login, Browsing, Purchases';
  const suspicion = `User belongs to suspicious “fraud ring ${Math.floor(Math.random() * 300)}”`;
  
  initialRows.push(createData(email, type, from, to, activity, suspicion));
}

export default function CollapsibleTable() {
  return (
    <TableContainer sx={{ maxHeight: 500 }} component={Paper}>
      <Table stickyHeader aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Email</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>From</TableCell>
            <TableCell>To</TableCell>
            <TableCell>Active Apps</TableCell>
            <TableCell>Suspicious Data</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {initialRows.map((row) => (
            <Row key={row.email} row={row} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}