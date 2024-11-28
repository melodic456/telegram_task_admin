import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import Users from "./components/Users";
import Tasks from "./components/Tasks";
import TaskSubmissions from "./components/TaskSubmissions";
import Withdrawals from "./components/Withdrawals";

function App() {
  return (
    <Router>
      <div>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6">Admin Panel</Typography>
            <Button color="inherit" component={Link} to="/users">Users</Button>
            <Button color="inherit" component={Link} to="/tasks">Tasks</Button>
            <Button color="inherit" component={Link} to="/task-submissions">Task Submissions</Button>
            <Button color="inherit" component={Link} to="/withdrawals">Withdrawals</Button>
          </Toolbar>
        </AppBar>
        <Routes>
          <Route path="/users" element={<Users />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/task-submissions" element={<TaskSubmissions />} />
          <Route path="/withdrawals" element={<Withdrawals />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
