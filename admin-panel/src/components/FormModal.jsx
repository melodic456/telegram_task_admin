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
