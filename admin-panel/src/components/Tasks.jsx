import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination } from "@mui/material";
import FormModal from "./FormModal";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5); // Number of tasks per page

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    // Filter tasks based on search query
    const filtered = tasks.filter((task) =>
      Object.values(task)
        .join(" ") // Join all values of the task object into a single string
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );

    setFilteredTasks(filtered);
    setPage(0); // Reset to the first page when the filtered tasks change
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to the first page
  };

  // Calculate the current tasks to display based on pagination
  const currentTasks = filteredTasks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
              <TableCell>Priority</TableCell>
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
                <TableCell>{task.priority}</TableCell>
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
      <TablePagination
        rowsPerPageOptions={[5, 10 , 25]}
        component="div"
        count={filteredTasks.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      {/* {showModal && (
        <FormModal
          open={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={editingTask ? handleEdit : handleAdd}
          task={editingTask}
        />
      )} */}
       <FormModal
        show={showModal}
        onClose={() => { setShowModal(false); setEditingTask(null); }}
        onSubmit={editingTask ? handleEdit : handleAdd}
        initialData={editingTask}
        fields={["description", "reward", "taskType", "link", "priority"]}
      />
    </div>
  );
};

export default Tasks;