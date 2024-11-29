import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination } from "@mui/material";

const Withdrawals = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [filteredWithdrawals, setFilteredWithdrawals] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  useEffect(() => {
    const filtered = withdrawals.filter((withdrawal) =>
      Object.values(withdrawal)
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
    setFilteredWithdrawals(filtered);
    setPage(0); // Reset to the first page when the filtered withdrawals change
  }, [searchTerm, withdrawals]);

  const fetchWithdrawals = async () => {
    const response = await axios.get("http://195.7.6.213:3001/withdrawals");
    setWithdrawals(response.data);
    setFilteredWithdrawals(response.data);
  };

  const handleApprove = async (id) => {
    await axios.put(`http://195.7.6.213:3001/withdrawals/${id}`, { status: "approved" });
    fetchWithdrawals();
  };

  const handleReject = async (id) => {
    await axios.put(`http://195.7.6.213:3001/withdrawals/${id}`, { status: "rejected" });
    fetchWithdrawals();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to the first page
  };

  const currentWithdrawals = filteredWithdrawals.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <div>
      <h2>Withdrawals</h2>
      
      {/* Search Input */}
      <TextField
        label="Search Withdrawals"
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        margin="normal"
      />
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User ID</TableCell>
              <TableCell>Balance</TableCell>
              <TableCell>Amount to Withdraw</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentWithdrawals.map((withdrawal) => (
              <TableRow key={withdrawal._id}>
                <TableCell>{withdrawal.userID}</TableCell>
                <TableCell>{withdrawal.balance}</TableCell>
                <TableCell>{withdrawal.toWithdraw}</TableCell>
                <TableCell>{withdrawal.status}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleApprove(withdrawal._id)}
                    disabled={withdrawal.status === "approved" || withdrawal.status === "rejected"}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleReject(withdrawal._id)}
                    disabled={withdrawal.status === "approved" || withdrawal.status === "rejected"}
                  >
                    Reject
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Pagination Controls */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredWithdrawals.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </div>
  );
};

export default Withdrawals;