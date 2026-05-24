import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_URL = process.env.REACT_APP_API_URL;

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    axios.get(`${API_URL}/tasks`).then(res => setTasks(res.data));
  }, []);

  const addTask = async () => {
    if (!title.trim()) return;
    const res = await axios.post(`${API_URL}/tasks`, { title });
    setTasks([...tasks, res.data]);
    setTitle("");
  };

  const toggleTask = async (id, completed) => {
    const res = await axios.put(`${API_URL}/tasks/${id}`, { completed: !completed });
    setTasks(tasks.map(t => (t.id === id ? res.data : t)));
  };

  const deleteTask = async (id) => {
    await axios.delete(`${API_URL}/tasks/${id}`);
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Todo List</h1>
        <div className="input-group">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Enter a task..."
          />
          <button className="add" onClick={addTask}>Add</button>
        </div>
        <ul>
          {tasks.map(t => (
            <li key={t.id}>
              <span
                className={t.completed ? "completed" : ""}
                onClick={() => toggleTask(t.id, t.completed)}
              >
                {t.title}
              </span>
              <button onClick={() => deleteTask(t.id)}>❌</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;