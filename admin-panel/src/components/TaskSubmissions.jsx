import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";

const TaskSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("asc"); // State to track sorting order
  const [sortBy, setSortBy] = useState("timestamp"); // State to track which field is being sorted

  useEffect(() => {
    fetchSubmissions();
  }, []);

  useEffect(() => {
    // Filter submissions based on search query
    const filtered = submissions.filter((submission) => {
      const { userId, taskId, proof, reviewed, timestamp, status } = submission;
      // Search across all fields, including the nested proof.text field
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

  // Function to handle the deletion of a submission
  const handleDelete = async (id) => {
    await axios.delete(`http://195.7.6.213:3001/task-submissions/${id}`);
    fetchSubmissions();
  };

  // Sort submissions based on the field and sort order
  const sortSubmissions = (submissions, sortBy, sortOrder) => {
    const sorted = [...submissions]; // Create a copy to avoid mutating original data
    sorted.sort((a, b) => {
      const aValue = sortBy === "timestamp" ? new Date(a[sortBy]).getTime() : a[sortBy];
      const bValue = sortBy === "timestamp" ? new Date(b[sortBy]).getTime() : b[sortBy];
      
      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  };

  // Function to toggle the sorting direction
  const handleSort = (field) => {
    const newSortOrder = sortBy === field && sortOrder === "asc" ? "desc" : "asc";
    setSortBy(field);
    setSortOrder(newSortOrder);
  };

  return (
    <div>
      <h2>Task Submissions</h2>
      
      {/* Search Field */}
      <TextField
        label="Search Task Submissions"
        variant="outlined"
        fullWidth
        onChange={(e) => setSearchQuery(e.target.value)}
        value={searchQuery}
        style={{ marginBottom: "20px" }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User ID</TableCell>
              <TableCell>Task ID</TableCell>
              <TableCell>Proof</TableCell>
              <TableCell>Reviewed</TableCell>
              <TableCell>
                {/* Add sorting functionality for timestamp column */}
                <Button onClick={() => handleSort("timestamp")} style={{ textTransform: "none" }}>
                  Timestamp {sortBy === "timestamp" && (sortOrder === "asc" ? "↑" : "↓")}
                </Button>
              </TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSubmissions.map((submission) => (
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
                  {/* Delete Button */}
                  <Button variant="contained" color="error" onClick={() => handleDelete(submission._id)} style={{ marginLeft: "10px" }}>
                    Delete
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

export default TaskSubmissions;
