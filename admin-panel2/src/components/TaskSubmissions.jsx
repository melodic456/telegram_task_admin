import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";

const TaskSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    const response = await axios.get("http://localhost:3000/task-submissions");
    setSubmissions(response.data);
  };

  const handleApprove = async (id) => {
    await axios.put(`http://localhost:3000/task-submissions/${id}`, { status: "approved" });
    fetchSubmissions();
  };

  const handleReject = async (id) => {
    await axios.put(`http://localhost:3000/task-submissions/${id}`, { status: "rejected" });
    fetchSubmissions();
  };

  return (
    <div>
      <h2>Task Submissions</h2>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User ID</TableCell>
              <TableCell>Task ID</TableCell>
              <TableCell>Proof</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {submissions.map((submission) => (
              <TableRow key={submission._id}>
                <TableCell>{submission.userId}</TableCell>
                <TableCell>{submission.taskId}</TableCell>
                <TableCell>{submission.proof}</TableCell>
                <TableCell>{submission.status}</TableCell>
                <TableCell>
                  <Button variant="contained" color="primary" onClick={() => handleApprove(submission._id)}>
                    Approve
                  </Button>
                  <Button variant="contained" color="secondary" onClick={() => handleReject(submission._id)}>
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

export default TaskSubmissions;
