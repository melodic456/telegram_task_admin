import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination } from "@mui/material";

const TaskSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortBy, setSortBy] = useState("timestamp");

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5); // Number of submissions per page

  useEffect(() => {
    fetchSubmissions();
  }, []);

  useEffect(() => {
    // Filter submissions based on search query
    const filtered = submissions.filter((submission) => {
      const { userId, taskId, proof, reviewed, timestamp, status } = submission;
      return (
        (userId?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
          taskId?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
          proof?.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          reviewed?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
          new Date(timestamp).toLocaleString().toLowerCase().includes(searchQuery.toLowerCase()) ||
          status?.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });

    // Sort submissions after filtering
    const sorted = sortSubmissions(filtered, sortBy, sortOrder);
    setFilteredSubmissions(sorted);
    // Reset to the first page when the filtered submissions change
    setPage(0);
  }, [searchQuery, submissions, sortBy, sortOrder]);

  const fetchSubmissions = async () => {
    const response = await axios.get("http://195.7.6.213:3001/task-submissions");
    console.log(response.data);
    setSubmissions(response.data);
  };

  const handleApprove = async (id) => {
    await axios.put(`http://195.7.6.213:3001/task-submissions/${id}`, { status: "approved", reviewed: true });
    fetchSubmissions();
  };

  const handleReject = async (id) => {
    await axios.put(`http://195.7.6.213:3001/task-submissions/${id}`, { status: "rejected", reviewed: true });
    fetchSubmissions();
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://195.7.6.213:3001/task-submissions/${id}`);
    fetchSubmissions();
  };

  const sortSubmissions = (submissions, sortBy, sortOrder) => {
    const sorted = [...submissions];
    sorted.sort((a, b) => {
      const aValue = sortBy === "timestamp" ? new Date(a[sortBy]).getTime() : a[sortBy];
      const bValue = sortBy === "timestamp" ? new Date(b[sortBy]).getTime() : b[sortBy];
      
      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  };

  const handleSort = (field) => {
    const newSortOrder = sortBy === field && sortOrder === "asc" ? "desc" : "asc";
    setSortBy(field);
    setSortOrder(newSortOrder);
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to the first page
  };

  // Calculate the current submissions to display based on pagination
  const currentSubmissions = filteredSubmissions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <div>
      <h2>Task Submissions</h2>
      
      {/* Search Field */}
      <TextField
        label="Search Task Sub missions"
        variant="outlined"
        fullWidth
        onChange={(e) => setSearchQuery(e.target.value)}
        value={searchQuery}
        style={{ marginBottom: "20px" }}
      />
      
      {/* Submissions Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell onClick={() => handleSort("userId")}>User  ID</TableCell>
              <TableCell onClick={() => handleSort("taskId")}>Task ID</TableCell>
              <TableCell onClick={() => handleSort("proof")}>Proof</TableCell>
              <TableCell onClick={() => handleSort("reviewed")}>Reviewed</TableCell>
              <TableCell onClick={() => handleSort("timestamp")}>Timestamp</TableCell>
              <TableCell onClick={() => handleSort("status")}>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentSubmissions.map((submission) => (
              <TableRow key={submission._id}>
                <TableCell>{submission.userId}</TableCell>
                <TableCell>{submission.taskId}</TableCell>
                <TableCell>{submission.proof.text}</TableCell>
                <TableCell>{submission.reviewed ? "Yes" : "No"}</TableCell>
                <TableCell>{new Date(submission.timestamp).toLocaleString()}</TableCell>
                <TableCell>{submission.status}</TableCell>
                <TableCell>
                  <Button variant="contained" color="primary" onClick={() => handleApprove(submission._id)}>
                    Approve
                  </Button>
                  <Button variant="contained" color="secondary" onClick={() => handleReject(submission._id)}>
                    Reject
                  </Button>
                  <Button variant="contained" color="error" onClick={() => handleDelete(submission._id)}>
                    Delete
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
        count={filteredSubmissions.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </div>
  );
};

export default TaskSubmissions;