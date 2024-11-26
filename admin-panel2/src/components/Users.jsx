import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import FormModal from "./FormModal";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    setFilteredUsers(
      users.filter((user) =>
        user.wallet.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    const response = await axios.get("http://localhost:3000/users");
    setUsers(response.data);
  };

  const handleAdd = async (user) => {
    await axios.post("http://localhost:3000/users", user);
    fetchUsers();
  };

  const handleEdit = async (user) => {
    await axios.put(`http://localhost:3000/users/${user._id}`, user);
    fetchUsers();
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:3000/users/${id}`);
    fetchUsers();
  };

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
              <TableCell>Wallet</TableCell>
              <TableCell>Balance</TableCell>
              <TableCell>To Withdraw</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.wallet}</TableCell>
                <TableCell>{user.balance}</TableCell>
                <TableCell>{user.toWithdraw}</TableCell>
                <TableCell>
                  <Button variant="contained" color="secondary" onClick={() => { setEditingUser(user); setShowModal(true); }}>
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
      </TableContainer>
      <FormModal
        show={showModal}
        onClose={() => { setShowModal(false); setEditingUser(null); }}
        onSubmit={editingUser ? handleEdit : handleAdd}
        initialData={editingUser}
        fields={["wallet", "balance", "toWithdraw"]}
      />
    </div>
  );
};

export default Users;
