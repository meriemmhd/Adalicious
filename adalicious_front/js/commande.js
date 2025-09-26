async function fetchOrders() {
  try {
    const res = await fetch("http://localhost:3000/orders");
    const orders = await res.json();

    const ul = document.getElementById("orders-list");
    ul.innerHTML = "";

    if (orders.length === 0) {
      ul.innerHTML = "<li>Aucune commande reçue</li>";
      return;
    }

    orders.forEach(order => {
      const li = document.createElement("li");
      // Formatage de la date en local
      const date = new Date(order.created_at).toLocaleString();
      li.textContent = `${date} - ${order.client_name} a commandé : ${order.plate} (${order.status})`;
      ul.appendChild(li);
    });
  } catch (err) {
    console.error("Erreur chargement commandes:", err);
  }
}

async function sendOrder(plate, clientName) {
  try {
    const res = await fetch("http://localhost:3000/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plate, client_name: clientName }), // client_name au lieu de clientName
    });

    const data = await res.json();

    if (res.ok) {
      alert("Commande envoyée avec succès !");
      fetchOrders();
    } else {
      alert("Erreur : " + (data.error || "Commande non envoyée"));
    }
  } catch (err) {
    alert("Impossible d'envoyer la commande.");
    console.error(err);
  }
}

document.querySelectorAll(".commander-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const plate = btn.dataset.plate;
    const clientName = "Meriem"; // Tu peux changer ça dynamiquement si besoin
    sendOrder(plate, clientName);
  });
});

// Recharge toutes les 3 secondes
setInterval(fetchOrders, 3000);
fetchOrders();
