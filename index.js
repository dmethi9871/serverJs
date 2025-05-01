const express = require("express");

const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: "postgres",
  host: "db.fdmjedqpunfcbikixlix.supabase.co",
  database: "postgres",
  password: "pgadmin",
  port: 5432,
});

pool
  .connect()
  .then((client) => {
    return client
      .query("SELECT NOW()")
      .then((res) => {
        console.log("Database connected successfully at", res.rows[0].now);
        client.release();
      })
      .catch((err) => {
        client.release();
        console.error("Database connection error:", err.stack);
      });
  })
  .catch((err) => {
    console.error("Error acquiring client from pool:", err.stack);
  });

// DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.fdmjedqpunfcbikixlix.supabase.co:5432/postgres

app.get("/api/products", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT article_no, name, in_price, price, unit, stock, description FROM products ORDER BY id ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.put("/api/products/:id", async (req, res) => {
  const { id } = req.params;
  const { article_no, name, in_price, price, unit, stock, description } =
    req.body;
  try {
    await pool.query(
      `UPDATE products SET article_no = $1, name = $2, in_price = $3, price = $4, unit = $5, stock = $6, description = $7 WHERE id = $8`,
      [article_no, name, in_price, price, unit, stock, description, id]
    );
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send("Update failed");
  }
});

app.post("/api/products", async (req, res) => {
  const { article_no, name, in_price, price, unit, stock, description } =
    req.body;
  try {
    const result = await pool.query(
      `INSERT INTO products (article_no, name, in_price, price, unit, stock, description) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING article_no, name, in_price, price, unit, stock, description`,
      [article_no, name, in_price, price, unit, stock, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Insert failed");
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
