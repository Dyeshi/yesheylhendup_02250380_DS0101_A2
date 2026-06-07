import { useEffect, useState } from "react"
import axios from "axios"

const API = "http://localhost:5000"

export default function App() {
  const [task, setTask] = useState("")
  const [tasks, setTasks] = useState([])

  // GET tasks
  const fetchTasks = async () => {
    const res = await axios.get(`${API}/tasks`)
    setTasks(res.data)
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  // ADD task
  const addTask = async () => {
    await axios.post(`${API}/tasks`, { task })
    setTask("")
    fetchTasks()
  }

  // DELETE task
  const deleteTask = async (index) => {
    await axios.delete(`${API}/tasks/${index}`)
    fetchTasks()
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Full Stack Todo App</h1>

      <input
        value={task}
        onChange={(e) => setTask(e.target.value)}
        placeholder="Enter task"
      />

      <button onClick={addTask}>Add</button>

      <ul>
        {tasks.map((t, i) => (
          <li key={i}>
            {t}
            <button onClick={() => deleteTask(i)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
