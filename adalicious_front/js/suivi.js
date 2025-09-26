async function fetchOrders() {
  try {
    const res = await fetch("http://localhost:3000/orders");
    if (!res.ok) throw new Error("Erreur HTTP " + res.status);

    const orders = await res.json();

    const ul = document.getElementById("orders-list");
    ul.innerHTML = "";

    if (orders.length === 0) {
      ul.innerHTML = "<li>Aucune commande reçue</li>";
      return;
    }

    orders.forEach(order => {
      const li = document.createElement("li");
      const date = new Date(order.created_at).toLocaleString();
      li.textContent = `${date} - ${order.client_name} a commandé : ${order.plate} (${order.status})`;
      ul.appendChild(li);
    });
  } catch (err) {
    console.error("Erreur chargement commandes:", err);
  }
}

fetchOrders();
setInterval(fetchOrders, 3000);
