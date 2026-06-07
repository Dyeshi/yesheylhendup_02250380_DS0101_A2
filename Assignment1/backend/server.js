import express from "express"
import cors from "cors"
import dotenv from "dotenv"

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 5000

// temporary in-memory DB
let tasks = []

// GET all tasks
app.get("/tasks", (req, res) => {
  res.json(tasks)
})

// POST add task
app.post("/tasks", (req, res) => {
  const { task } = req.body
  tasks.push(task)
  res.json({ message: "Task added", tasks })
})

// DELETE task
app.delete("/tasks/:index", (req, res) => {
  const { index } = req.params
  tasks.splice(index, 1)
  res.json({ message: "Task deleted", tasks })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
