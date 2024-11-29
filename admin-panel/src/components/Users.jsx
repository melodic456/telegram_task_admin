import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination } from "@mui/material";
import FormModal from "./FormModal";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser , setEditingUser ] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5); // Number of users per page

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    setFilteredUsers(
      users.filter((user) =>
        Object.values(user)
          .join(" ") // Join all values of the user object into a single string
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
    );
    // Reset to the first page when the filtered users change
    setPage(0);
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    const response = await axios.get("http://195.7.6.213:3001/users");
    console.log(response.data);
    setUsers(response.data);
  };

  const handleAdd = async (user) => {
    await axios.post("http://195.7.6.213:3001/users", user);
    fetchUsers();
  };

  const handleEdit = async (user) => {
    await axios.put(`http://195.7.6.213:3001/users/${user._id}`, user);
    fetchUsers();
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://195.7.6.213:3001/users/${id}`);
    fetchUsers();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to the first page
  };

  // Calculate the current users to display based on pagination
  const currentUsers = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <div>
      <h2>Users</h2>
      <TextField
        label="Search Users"
        variant="outlined"
        fullWidth
        onChange={(e) => setSearchQuery(e.target.value)}
        value={searchQuery}
        style={{ marginBottom: "20px" }}
      />
      <Button variant="contained" color="primary" onClick={() => setShowModal(true)} style={{ marginBottom: "20px" }}>
        Add User
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>UserID</TableCell>
              <TableCell>Balance</TableCell>
              <TableCell>To Withdraw</TableCell>
              <TableCell>Wallet</TableCell>
              <TableCell>Stats</TableCell>
              <TableCell>Value</TableCell>
              <TableCell>Inviter</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentUsers.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.userID}</TableCell>
                <TableCell>{user.balance}</TableCell>
                <TableCell>{user.toWithdraw}</TableCell>
                <TableCell>{user.wallet}</TableCell>
                <TableCell>{user.stats}</TableCell>
                <TableCell>{user.value}</TableCell>
                <TableCell>{user.inviter}</TableCell>
                <TableCell>
                  <Button variant="contained" color="secondary" onClick={() => { setEditingUser (user); setShowModal(true); }}>
                    Edit
                  </Button>
                  <Button variant="contained" color="error" onClick={() => handleDelete(user._id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredUsers.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      {showModal && (
        <FormModal
          user={editingUser }
          onClose={() => { setShowModal(false); setEditingUser (null); }}
          onAdd={handleAdd}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
};

export default Users;