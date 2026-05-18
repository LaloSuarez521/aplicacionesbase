import { Hono } from 'hono'
import { Database } from 'bun:sqlite'

// Abrimos o creamos la base de datos SQLite
const db = new Database('./base.sqlite3')

// Creamos la tabla todos si no existe
db.run(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    todo TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`)

// Creamos la aplicacion con Hono
const app = new Hono()

// Ruta de prueba para verificar que el servidor funciona
app.get('/', (c) => {
  return c.json({
    status: 'ok',
    mensaje: 'Servidor funcionando correctamente'
  })
})

// Endpoint solicitado en la actividad
app.post('/agrega_todo', async (c) => {
  let body

  try {
    body = await c.req.json()
  } catch {
    return c.json({
      error: 'Debes enviar datos en formato JSON'
    }, 400)
  }

  const { todo } = body

  if (!todo) {
    return c.json({
      error: 'El campo todo es obligatorio'
    }, 400)
  }

  try {
    const stmt = db.prepare('INSERT INTO todos (todo) VALUES (?)')
    const result = stmt.run(todo)

    return c.json({
      mensaje: 'Todo agregado correctamente',
      id: Number(result.lastInsertRowid),
      todo: todo
    }, 201)

  } catch (error) {
    return c.json({
      error: error.message
    }, 500)
  }
})

// Endpoint extra para revisar los datos guardados
app.get('/todos', (c) => {
  const todos = db.query('SELECT * FROM todos').all()
  return c.json(todos)
})

export { app, db }

export default {
  port: process.env.PORT || 3000,
  fetch: app.fetch,
}




