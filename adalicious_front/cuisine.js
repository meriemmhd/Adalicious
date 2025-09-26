const socket = io("http://localhost:3000");

const ordersList = document.getElementById("orders-list");

function createOrderElement(order) {
  const li = document.createElement("li");
  li.dataset.id = order.id;
  li.textContent = `${order.client_name} a commandé : ${order.plate} (${order.status})`;
  return li;
}

// Initialisation des commandes
socket.on("orders_init", (orders) => {
  console.log("orders_init reçu :", orders);
  ordersList.innerHTML = "";
  orders.forEach(order => {
    ordersList.appendChild(createOrderElement(order));
  });
});

// Nouvelle commande
socket.on("order_create", (order) => {
  console.log("Nouvelle commande :", order);
  const li = createOrderElement(order);
  ordersList.prepend(li);
});

// Mise à jour d'une commande
socket.on("order_update", (updatedOrder) => {
  console.log("Commande mise à jour :", updatedOrder);
  const li = ordersList.querySelector(`li[data-id="${updatedOrder.id}"]`);
  if (li) {
    li.textContent = `${updatedOrder.client_name} a commandé : ${updatedOrder.plate} (${updatedOrder.status})`;
  }
});

// Suppression
socket.on("order_delete", (deletedOrderId) => {
  const li = ordersList.querySelector(`li[data-id="${deletedOrderId}"]`);
  if (li) {
    li.remove();
  }
});
