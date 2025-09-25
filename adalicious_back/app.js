// app.js
import 'dotenv/config'
import { neon } from '@neondatabase/serverless'

// Initialise la connexion
const sql = neon(process.env.DATABASE_URL)

async function main() {
  await sql`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50),
    email VARCHAR(100) UNIQUE
  )
`

await sql`
  INSERT INTO users (name, email) VALUES ('Alice', 'alice@example.com')
`


  const result = await sql`SELECT version()`
  console.log(result[0])
}


main().catch(console.error)
