import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors({
  origin: ["http://127.0.0.1:5500", "http://localhost:5500"]
}));


const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://127.0.0.1:5500", "http://localhost:5500"]
  }
});

const sql = neon(process.env.DATABASE_URL);

app.get("/", (req, res) => {
  res.send("Accueil 🚀");
});

app.get("/menu", async (req, res) => {
  try {
    const result = await sql`SELECT * FROM menus ORDER BY id;`;
    res.json(result);
  } catch {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.get("/menu/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    const result = await sql`SELECT * FROM menus WHERE id = ${id};`;
    if (result.length === 0) return res.status(404).json({ error: "Plat non trouvé" });
    res.json(result[0]);
  } catch {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.post("/menu", async (req, res) => {
  const { plate, description, image } = req.body;
  if (!plate) return res.status(400).json({ error: "Le champ plate est obligatoire" });
  try {
    const result = await sql`
      INSERT INTO menus (plate, description, image)
      VALUES (${plate}, ${description}, ${image})
      RETURNING *;
    `;
    res.status(201).json(result[0]);
  } catch {
    res.status(500).json({ error: "Impossible d'ajouter le plat" });
  }
});

// POST /orders - création d'une commande + émission socket
app.post("/orders", async (req, res) => {
  const { plate, clientName } = req.body;
  if (!plate || !clientName) return res.status(400).json({ error: "Champs manquants" });

  try {
    const result = await sql`
      INSERT INTO orders (plate, client_name)
      VALUES (${plate}, ${clientName})
      RETURNING *;
    `;

    const newOrder = result[0];

    // Émettre l'événement à tous les clients connectés
    io.emit("order_create", newOrder);

    res.status(201).json({ ok: true, order: newOrder });
  } catch (err) {
    console.error("Erreur ajout commande:", err);
    res.status(500).json({ error: "Impossible d'ajouter la commande" });
  }
});

app.get("/orders", async (req, res) => {
  try {
    const result = await sql`
      SELECT * FROM orders ORDER BY created_at DESC;
    `;
    console.log("Orders récupérées:", result);
    res.json(result);
  } catch (err) {
    console.error("Erreur lors récupération commandes:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.get("/orders/:id", async (req, res) => {
  try {
    const result = await sql`SELECT * FROM orders WHERE id = ${req.params.id};`;
    if (result.length === 0) return res.status(404).json({ error: "Commande introuvable" });
    res.json(result[0]);
  } catch {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// PATCH /orders/:id - mise à jour + émission socket
app.patch("/orders/:id", async (req, res) => {
  const { status } = req.body;
  const allowed = ["pending", "in_progress", "ready", "cancelled"];
  if (!allowed.includes(status)) return res.status(400).json({ error: "Statut invalide" });
  try {
    const result = await sql`
      UPDATE orders SET status = ${status}, updated_at = now()
      WHERE id = ${req.params.id}
      RETURNING *;
    `;
    if (result.length === 0) return res.status(404).json({ error: "Commande introuvable" });

    const order = result[0];
    io.emit("order_update", order); // Émettre l'événement

    res.json(order);
  } catch {
    res.status(500).json({ error: "Erreur mise à jour" });
  }
});

// DELETE /orders/:id - suppression + émission socket
app.delete("/orders/:id", async (req, res) => {
  try {
    await sql`DELETE FROM orders WHERE id = ${req.params.id};`;
    io.emit("order_delete", req.params.id); // Émettre l'événement
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Erreur suppression" });
  }
});

// Socket.IO - connexion client
io.on("connection", async (socket) => {
  console.log("Client connecté:", socket.id);
  try {
    const result = await sql`
      SELECT * FROM orders WHERE status IN ('pending', 'in_progress')
      ORDER BY created_at DESC;
    `;
    socket.emit("orders_init", result);
  } catch {
    socket.emit("orders_init", []);
  }
});

async function testConnection() {
  try {
    const result = await sql`SELECT version();`;
    console.log("✅ Connecté à Neon:", result[0].version);
  } catch (err) {
    console.error("❌ Erreur connexion Neon:", err);
  }
}

httpServer.listen(port, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${port}`);
  testConnection();
});
