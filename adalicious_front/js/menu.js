

const params = new URLSearchParams(window.location.search);
const name = params.get("name");
const client_name = document.getElementById("client_name");
console.log(client_name);
console.log(name);
client_name.textContent = `Bonjour ${name} ! `


async function commanderPlat(plat) {
    try {
        const resp = await fetch("http://localhost:3000/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: plat.id,
                plate: plat.plate,
                clientName: name,
            }),
        });
        const data = await resp.json();
        if (!data.ok) throw new Error(data.error);
        alert(`✅ ${data.message}`);
    }
    catch (e) {
        alert("❌ Impossible d'envoyer la commande.");
        console.error(e);
    }
}

async function fetchMenus() {
    try {
        const res = await fetch(`http://localhost:3000/menu`);
        const menus = await res.json();
        console.log('menus', menus)
        const ul = document.getElementById("menu-list");
        ul.innerHTML = "";
        menus.forEach((plat) => {
            const li = document.createElement("li");
            const emoji = document.createElement("span");
            emoji.textContent = plat.image;
            li.appendChild(emoji);
            const nameEl = document.createElement("strong");
            nameEl.textContent = plat.plate;
            li.appendChild(nameEl);
            const desc = document.createElement("p");
            desc.textContent = plat.description;
            li.appendChild(desc);
            const btn = document.createElement("button");
            btn.textContent = "Commander";
            btn.addEventListener("click", () => commanderPlat(plat));
            li.appendChild(btn);
            ul.appendChild(li);

        });
    }
    catch (err) {
        console.error("Erreur :", err);
    }
}


fetchMenus();