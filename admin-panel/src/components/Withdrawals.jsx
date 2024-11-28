import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField } from "@mui/material";

const Withdrawals = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // State to hold the search term
  const [filteredWithdrawals, setFilteredWithdrawals] = useState([]); // State for filtered withdrawals

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  useEffect(() => {
    // Filter withdrawals based on the search term
    if (searchTerm) {
      const filtered = withdrawals.filter((withdrawal) =>
        Object.values(withdrawal)
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
      setFilteredWithdrawals(filtered);
    } else {
      setFilteredWithdrawals(withdrawals); // If search term is empty, show all withdrawals
    }
  }, [searchTerm, withdrawals]);

  const fetchWithdrawals = async () => {
    const response = await axios.get("http://195.7.6.213:3001/withdrawals"); // Adjust API URL as needed
    setWithdrawals(response.data);
    setFilteredWithdrawals(response.data); // Initialize filtered withdrawals with the fetched data
  };

  const handleApprove = async (id) => {
    await axios.put(`http://195.7.6.213:3001/withdrawals/${id}`, { status: "approved" });
    fetchWithdrawals(); // Reload the data after approval
  };

  const handleReject = async (id) => {
    await axios.put(`http://195.7.6.213:3001/withdrawals/${id}`, { status: "rejected" });
    fetchWithdrawals(); // Reload the data after rejection
  };

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
            {filteredWithdrawals.map((withdrawal) => (
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
    </div>
  );
};

export default Withdrawals;
