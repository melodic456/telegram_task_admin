import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";

const TaskSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    fetchSubmissions();
  }, []);

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
              <TableCell>Reviewed</TableCell>
              <TableCell>Timestamp</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {submissions.map((submission) => (
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
