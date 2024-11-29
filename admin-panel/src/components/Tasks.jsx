import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import FormModal from "./FormModal";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 5; // Change this value to set how many tasks you want per page

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    setFilteredTasks(
      tasks.filter((task) =>
        Object.values(task)
          .join(" ")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, tasks]);

  const fetchTasks = async () => {
    const response = await axios.get("http://195.7.6.213:3001/tasks");
    setTasks(response.data);
  };

  const handleAdd = async (task) => {
    await axios.post("http://195.7.6.213:3001/tasks", task);
    fetchTasks();
  };

  const handleEdit = async (task) => {
    await axios.put(`http://195.7.6.213:3001/tasks/${task._id}`, task);
    fetchTasks();
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://195.7.6.213:3001/tasks/${id}`);
    fetchTasks();
  };

  // Pagination logic
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div>
      <h2>Tasks</h2>
      <TextField
        label="Search Tasks"
        variant="outlined"
        fullWidth
        onChange={(e) => setSearchQuery(e.target.value)}
        value={searchQuery}
        style={{ marginBottom: "20px" }}
      />
      <Button variant="contained" color="primary" onClick={() => setShowModal(true)} style={{ marginBottom: "20px" }}>
        Add Task
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Task ID</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Reward</TableCell>
              <TableCell>Task Type</TableCell>
              <TableCell>Link</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentTasks.map((task) => (
              <TableRow key={task._id}>
                <TableCell>{task._id}</TableCell>
                <TableCell>{task.description}</TableCell>
                <TableCell>{task.reward}</TableCell>
                <TableCell>{task.taskType ? "Auto" : "Manual"}</TableCell>
                <TableCell>{task.link}</TableCell>
                <TableCell>
                  <Button variant="contained" color="secondary" onClick={() => { setEditingTask(task); setShowModal(true); }}>
                    Edit
                  </Button>
                  <Button variant="contained" color="error" onClick={() => handleDelete(task._id)}>
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
        onClose={() => { setShowModal(false); setEditingTask(null); }}
        onSubmit={editingTask ? handleEdit : handleAdd}
        initialData={editingTask }
            />
            <div>
                {/* Pagination Controls */}
                <Button 
                    disabled={currentPage === 1} 
                    onClick={() => handlePageChange(currentPage - 1)}
                >
                    Previous
                </Button>
                {Array.from({ length: totalPages }, (_, index) => (
                    <Button 
                        key={index + 1} 
                        onClick={() => handlePageChange(index + 1)} 
                        variant={currentPage === index + 1 ? "contained" : "outlined"}
                    >
                        {index + 1}
                    </Button>
                ))}
                <Button 
                    disabled={currentPage === totalPages} 
                    onClick={() => handlePageChange(currentPage + 1)}
                >
                    Next
                </Button>
            </div>
        </div>
    );
};

export default Tasks;