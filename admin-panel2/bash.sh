#!/bin/bash

# Set the base directory for your React project
BASE_DIR="src/components"

# Create the components directory if it doesn't exist
mkdir -p "$BASE_DIR"

# Create App.js
cat <<EOL > "src/App.js"
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import Users from "./components/Users";
import Tasks from "./components/Tasks";
import TaskSubmissions from "./components/TaskSubmissions";

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
          </Toolbar>
        </AppBar>
        <Routes>
          <Route path="/users" element={<Users />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/task-submissions" element={<TaskSubmissions />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
EOL

# Create Users.jsx
cat <<EOL > "$BASE_DIR/Users.jsx"
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
    await axios.put(\`http://localhost:3000/users/\${user._id}\`, user);
    fetchUsers();
  };

  const handleDelete = async (id) => {
    await axios.delete(\`http://localhost:3000/users/\${id}\`);
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
EOL

# Create Tasks.jsx
cat <<EOL > "$BASE_DIR/Tasks.jsx"
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

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    setFilteredTasks(
      tasks.filter((task) =>
        task.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, tasks]);

  const fetchTasks = async () => {
    const response = await axios.get("http://localhost:3000/tasks");
    setTasks(response.data);
  };

  const handleAdd = async (task) => {
    await axios.post("http://localhost:3000/tasks", task);
    fetchTasks();
  };

  const handleEdit = async (task) => {
    await axios.put(\`http://localhost:3000/tasks/\${task._id}\`, task);
    fetchTasks();
  };

  const handleDelete = async (id) => {
    await axios.delete(\`http://localhost:3000/tasks/\${id}\`);
    fetchTasks();
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
              <TableCell>Description</TableCell>
              <TableCell>Reward</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTasks.map((task) => (
              <TableRow key={task._id}>
                <TableCell>{task.description}</TableCell>
                <TableCell>{task.reward}</TableCell>
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
        initialData={editingTask}
        fields={["description", "reward"]}
      />
    </div>
  );
};

export default Tasks;
EOL

# Create TaskSubmissions.jsx
cat <<EOL > "$BASE_DIR/TaskSubmissions.jsx"
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
    await axios.put(\`http://localhost:3000/task-submissions/\${id}\`, { status: "approved" });
    fetchSubmissions();
  };

  const handleReject = async (id) => {
    await axios.put(\`http://localhost:3000/task-submissions/\${id}\`, { status: "rejected" });
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
EOL

echo "All files created successfully!"

#____________________

#!/bin/bash

# Step 1: Navigate to the project directory
# (Ensure you're in the correct project folder before running the script)
cd /path/to/your/project || { echo "Directory not found!"; exit 1; }

# Step 2: Install or update Material-UI dependencies
echo "Installing Material-UI dependencies..."
npm install @mui/material @emotion/react @emotion/styled

# Step 3: Back up original files (Optional)
echo "Backing up original files..."
mkdir -p backup
cp src/App.js src/components/Users.jsx src/components/Tasks.jsx src/components/TaskSubmissions.jsx src/components/FormModal.jsx backup/

# Step 4: Apply updates to App.js
echo "Updating App.js..."
cat <<EOL > src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import Users from "./components/Users";
import Tasks from "./components/Tasks";
import TaskSubmissions from "./components/TaskSubmissions";

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
          </Toolbar>
        </AppBar>
        <Routes>
          <Route path="/users" element={<Users />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/task-submissions" element={<TaskSubmissions />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
EOL

# Step 5: Apply updates to Users.jsx
echo "Updating Users.jsx..."
cat <<EOL > src/components/Users.jsx
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
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
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
    await axios.put(\`http://localhost:3000/users/\${user._id}\`, user);
    fetchUsers();
  };

  const handleDelete = async (id) => {
    await axios.delete(\`http://localhost:3000/users/\${id}\`);
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
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Wallet</TableCell>
              <TableCell>Balance</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.wallet}</TableCell>
                <TableCell>{user.balance}</TableCell>
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
        fields={["name", "email", "wallet", "balance"]}
      />
    </div>
  );
};

export default Users;
EOL

# Step 6: Apply updates to Tasks.jsx
echo "Updating Tasks.jsx..."
cat <<EOL > src/components/Tasks.jsx
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

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    setFilteredTasks(
      tasks.filter((task) =>
        task.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, tasks]);

  const fetchTasks = async () => {
    const response = await axios.get("http://localhost:3000/tasks");
    setTasks(response.data);
  };

  const handleAdd = async (task) => {
    await axios.post("http://localhost:3000/tasks", task);
    fetchTasks();
  };

  const handleEdit = async (task) => {
    await axios.put(\`http://localhost:3000/tasks/\${task._id}\`, task);
    fetchTasks();
  };

  const handleDelete = async (id) => {
    await axios.delete(\`http://localhost:3000/tasks/\${id}\`);
    fetchTasks();
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
              <TableCell>Description</TableCell>
              <TableCell>Reward</TableCell>
              <TableCell>Media</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTasks.map((task) => (
              <TableRow key={task._id}>
                <TableCell>{task.description}</TableCell>
                <TableCell>{task.reward}</TableCell>
                <TableCell>{task.media}</TableCell>
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
        initialData={editingTask}
        fields={["description", "reward", "media"]}
      />
    </div>
  );
};

export default Tasks;
EOL

# Step 7: Apply updates to TaskSubmissions.jsx
echo "Updating TaskSubmissions.jsx..."
cat <<EOL > src/components/TaskSubmissions.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";

const TaskSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    const response = await axios.get("http://localhost:3000/task-submissions");
    setSubmissions(response.data);
  };

  return (
    <div>
      <h2>Task Submissions</h2>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Task</TableCell>
              <TableCell>Completion Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {submissions.map((submission) => (
              <TableRow key={submission._id}>
                <TableCell>{submission.user.name}</TableCell>
                <TableCell>{submission.task.description}</TableCell>
                <TableCell>{submission.completionDate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default TaskSubmissions;
EOL

# Step 8: Apply updates to FormModal.jsx
echo "Updating FormModal.jsx..."
cat <<EOL > src/components/FormModal.jsx
import React, { useState, useEffect } from "react";
import { Modal, Box, TextField, Button } from "@mui/material";

const FormModal = ({ show, onClose, onSubmit, initialData = null, fields = [] }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  return (
    <Modal open={show} onClose={onClose}>
      <Box
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          maxWidth: "500px",
          width: "100%",
        }}
      >
        {fields.map((field) => (
          <TextField
            key={field}
            label={field.charAt(0).toUpperCase() + field.slice(1)}
            name={field}
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData[field] || ""}
            onChange={handleChange}
          />
        ))}
        <Button variant="contained" color="primary" onClick={handleSubmit} style={{ marginTop: "20px" }}>
          Submit
        </Button>
      </Box>
    </Modal>
  );
};

export default FormModal;
EOL
!/bin/bash

Check if a directory named "admin-panel" exists
if [ ! -d "admin-panel" ]; then
    echo "Creating React project admin-panel..."
    npx create-react-app admin-panel
    cd admin-panel || exit
    npm install axios react-router-dom
else
    echo "admin-panel directory already exists."
    cd admin-panel || exit
fi

# Create necessary directories
mkdir -p src/components

# Create App.js
echo "Creating App.js..."
cat > src/App.js <<EOL
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Users from "./components/Users";
import Tasks from "./components/Tasks";
import TaskSubmissions from "./components/TaskSubmissions";

function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li><Link to="/users">Users</Link></li>
            <li><Link to="/tasks">Tasks</Link></li>
            <li><Link to="/task-submissions">Task Submissions</Link></li>
          </ul>
        </nav>
        <Routes>
          <Route path="/users" element={<Users />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/task-submissions" element={<TaskSubmissions />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
EOL

# Create FormModal.jsx
echo "Creating FormModal.jsx..."
cat > src/components/FormModal.jsx <<EOL
import React, { useState } from "react";

const FormModal = ({ show, onClose, onSubmit, initialData, fields }) => {
  const [formData, setFormData] = useState(initialData || {});

  if (!show) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>{initialData ? "Edit" : "Add"} Item</h3>
        {fields.map((field) => (
          <div key={field}>
            <label>{field}</label>
            <input
              type="text"
              name={field}
              value={formData[field] || ""}
              onChange={handleChange}
            />
          </div>
        ))}
        <button onClick={handleSubmit}>Submit</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default FormModal;
EOL

# Create Users.jsx
echo "Creating Users.jsx..."
cat > src/components/Users.jsx <<EOL
import React, { useState, useEffect } from "react";
import axios from "axios";
import FormModal from "./FormModal";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const response = await axios.get("http://localhost:3000/users");
    setUsers(response.data);
  };

  const handleAdd = async (user) => {
    await axios.post("http://localhost:3000/users", user);
    fetchUsers();
  };

  const handleEdit = async (user) => {
    await axios.put(\`http://localhost:3000/users/\${user._id}\`, user);
    fetchUsers();
  };

  const handleDelete = async (id) => {
    await axios.delete(\`http://localhost:3000/users/\${id}\`);
    fetchUsers();
  };

  return (
    <div>
      <h2>Users</h2>
      <button onClick={() => setShowModal(true)}>Add User</button>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Wallet</th>
            <th>Balance</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.wallet}</td>
              <td>{user.balance}</td>
              <td>
                <button onClick={() => { setEditingUser(user); setShowModal(true); }}>Edit</button>
                <button onClick={() => handleDelete(user._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <FormModal
        show={showModal}
        onClose={() => { setShowModal(false); setEditingUser(null); }}
        onSubmit={editingUser ? handleEdit : handleAdd}
        initialData={editingUser}
        fields={["name", "email", "wallet", "balance"]}
      />
    </div>
  );
};

export default Users;
EOL

# Create Tasks.jsx
echo "Creating Tasks.jsx..."
cat > src/components/Tasks.jsx <<EOL
import React, { useState, useEffect } from "react";
import axios from "axios";
import FormModal from "./FormModal";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const response = await axios.get("http://localhost:3000/tasks");
    setTasks(response.data);
  };

  const handleAdd = async (task) => {
    await axios.post("http://localhost:3000/tasks", task);
    fetchTasks();
  };

  const handleEdit = async (task) => {
    await axios.put(\`http://localhost:3000/tasks/\${task._id}\`, task);
    fetchTasks();
  };

  const handleDelete = async (id) => {
    await axios.delete(\`http://localhost:3000/tasks/\${id}\`);
    fetchTasks();
  };

  return (
    <div>
      <h2>Tasks</h2>
      <button onClick={() => setShowModal(true)}>Add Task</button>
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Reward</th>
            <th>Media</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task._id}>
              <td>{task.description}</td>
              <td>{task.reward}</td>
              <td>{task.media}</td>
              <td>
                <button onClick={() => { setEditingTask(task); setShowModal(true); }}>Edit</button>
                <button onClick={() => handleDelete(task._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <FormModal
        show={showModal}
        onClose={() => { setShowModal(false); setEditingTask(null); }}
        onSubmit={editingTask ? handleEdit : handleAdd}
        initialData={editingTask}
        fields={["description", "reward", "media"]}
      />
    </div>
  );
};

export default Tasks;
EOL

# Create TaskSubmissions.jsx
echo "Creating TaskSubmissions.jsx..."
cat > src/components/TaskSubmissions.jsx <<EOL
import React, { useState, useEffect } from "react";
import axios from "axios";

const TaskSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    const response = await axios.get("http://localhost:3000/task-submissions");
    setSubmissions(response.data);
  };

  return (
    <div>
      <h2>Task Submissions</h2>
      <table>
        <thead>
          <tr>
            <th>Task ID</th>
            <th>User ID</th>
            <th>Proof Text</th>
            <th>Proof Media</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((submission) => (
            <tr key={submission._id}>
              <td>{submission.taskId}</td>
              <td>{submission.userId}</td>
              <td>{submission.proofText}</td>
              <td>{submission.proofMedia}</td>
              <td>{submission.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskSubmissions;
EOL

echo "Admin panel components generated successfully!"

# Step 9: Success message
echo "Update applied successfully!"

