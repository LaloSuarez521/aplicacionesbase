import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { Database } from 'bun:sqlite'

const app = new Hono()

app.use('*', cors())

const db = new Database('./base.sqlite3')

db.run(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    todo TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`)

app.get('/', (c) => {
  return c.json({
    status: 'ok',
    mensaje: 'API funcionando correctamente en Render'
  })
})

app.get('/todos', (c) => {
  try {
    const todos = db
      .query('SELECT id, todo, created_at FROM todos ORDER BY id DESC')
      .all()

    return c.json(todos)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/agrega_todo', async (c) => {
  try {
    const body = await c.req.json()
    const { todo } = body

    if (!todo) {
      return c.json({ error: 'Falta el campo todo' }, 400)
    }

    const stmt = db.prepare('INSERT INTO todos (todo) VALUES (?)')
    const result = stmt.run(todo)

    return c.json(
      {
        id: Number(result.lastInsertRowid),
        todo,
        mensaje: 'Tarea agregada correctamente'
      },
      201
    )
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/insert', async (c) => {
  try {
    const body = await c.req.json()
    const { todo } = body

    if (!todo) {
      return c.json({ error: 'Falta el campo todo' }, 400)
    }

    const stmt = db.prepare('INSERT INTO todos (todo) VALUES (?)')
    const result = stmt.run(todo)

    return c.json(
      {
        id: Number(result.lastInsertRowid),
        todo,
        mensaje: 'Tarea agregada correctamente'
      },
      201
    )
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

export default {
  port: process.env.PORT || 3000,
  fetch: app.fetch
}