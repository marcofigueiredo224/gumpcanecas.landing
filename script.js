// Gump Canecas Landing - JS
// 1) Troque o número abaixo para o seu WhatsApp (somente dígitos: país + DDD + número)
// Ex.: Brasil (55) + DDD (61) + número (999999999) => "5561999999999"
const WHATSAPP_NUMBER = "55SEUNUMEROAQUI";

// Produtos (edite como quiser)
const PRODUCTS = [
  { id: "time", name: "Caneca Time (modelo pronto)", price: 39.90, img: "./assets/caneca-flamengo.png", desc: "Escolha o time/tema e a gente monta a arte." },
  { id: "foto", name: "Caneca com Foto", price: 44.90, img: "./assets/caneca-foto.png", desc: "Envie a foto no WhatsApp para personalizar." },
  { id: "nome", name: "Caneca com Nome + Frase", price: 42.90, img: "./assets/caneca-nome.png", desc: "Nome, frase e cores do seu jeito." },
  { id: "aniver", name: "Caneca Aniversário", price: 44.90, img: "./assets/caneca-aniversario.png", desc: "Data + mensagem especial para presentear." },
  { id: "casal", name: "Kit Casal (2 canecas)", price: 79.90, img: "./assets/caneca-casal.png", desc: "Duas canecas combinando. Ideal para presente." },
  { id: "corp", name: "Caneca Corporativa", price: 49.90, img: "./assets/caneca-corporativa.png", desc: "Para empresas e eventos (desconto por quantidade)." },
];

// Estado do carrinho
let cart = loadCart(); // { [id]: qty }
let cartNotes = localStorage.getItem("gump_cart_notes") || "";

const elGrid = document.getElementById("productGrid");
const elCartCount = document.getElementById("cartCount");
const elDrawer = document.getElementById("drawer");
const elCartItems = document.getElementById("cartItems");
const elSubtotal = document.getElementById("subtotal");
const elCartNotes = document.getElementById("cartNotes");

const elSearch = document.getElementById("search");
const elSort = document.getElementById("sort");

const elCustomerName = document.getElementById("customerName");
const elCustomerObs = document.getElementById("customerObs");

function brl(value){
  return value.toLocaleString("pt-BR", { style:"currency", currency:"BRL" });
}

function saveCart(){
  localStorage.setItem("gump_cart", JSON.stringify(cart));
}

function loadCart(){
  try{
    return JSON.parse(localStorage.getItem("gump_cart") || "{}");
  }catch(e){
    return {};
  }
}

function cartCount(){
  return Object.values(cart).reduce((a,b)=>a+b,0);
}

function cartSubtotal(){
  return Object.entries(cart).reduce((sum,[id,qty])=>{
    const p = PRODUCTS.find(x=>x.id===id);
    return sum + (p ? p.price * qty : 0);
  }, 0);
}

function openDrawer(){
  elDrawer.classList.add("show");
  elDrawer.setAttribute("aria-hidden","false");
}

function closeDrawer(){
  elDrawer.classList.remove("show");
  elDrawer.setAttribute("aria-hidden","true");
}

function addToCart(id){
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  renderCart();
  openDrawer();
}

function setQty(id, qty){
  if(qty <= 0) delete cart[id];
  else cart[id] = qty;
  saveCart();
  renderCart();
}

function clearCart(){
  cart = {};
  saveCart();
  renderCart();
}

function buildWhatsMessage(){
  const name = (elCustomerName?.value || "").trim();
  const obsTop = (elCustomerObs?.value || "").trim();
  const notes = (elCartNotes?.value || "").trim();

  const lines = [];
  lines.push("Olá! Quero fazer um pedido na Gump Canecas ☕");
  if(name) lines.push(`Nome: ${name}`);

  lines.push("");
  lines.push("Itens:");
  Object.entries(cart).forEach(([id,qty], idx)=>{
    const p = PRODUCTS.find(x=>x.id===id);
    if(!p) return;
    lines.push(`${idx+1}) ${p.name} — ${qty}x (${brl(p.price)})`);
  });

  lines.push("");
  lines.push(`Subtotal: ${brl(cartSubtotal())}`);
  lines.push("Entrega: a combinar");
  lines.push("");

  const obsBlock = [obsTop, notes].filter(Boolean).join(" | ");
  if(obsBlock){
    lines.push("Observações:");
    lines.push(obsBlock);
    lines.push("");
  }

  lines.push("Pode me passar as opções de pagamento e prazo?");

  return lines.join("\n");
}

function openWhatsApp(message){
  if(!WHATSAPP_NUMBER || WHATSAPP_NUMBER.includes("SEUNUMEROAQUI")){
    alert("Falta configurar seu número do WhatsApp no script.js (WHATSAPP_NUMBER).");
    return;
  }
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener");
}

function renderProducts(){
  const q = (elSearch?.value || "").trim().toLowerCase();

  let list = PRODUCTS.filter(p=>{
    const hay = (p.name + " " + p.desc).toLowerCase();
    return hay.includes(q);
  });

  const sort = elSort?.value || "featured";
  if(sort === "price-asc") list.sort((a,b)=>a.price-b.price);
  if(sort === "price-desc") list.sort((a,b)=>b.price-a.price);
  if(sort === "name-asc") list.sort((a,b)=>a.name.localeCompare(b.name));

  elGrid.innerHTML = list.map(p=>`
    <article class="card">
      <img class="card__img" src="${p.img}" alt="${p.name}">
      <div class="card__body">
        <div class="card__title">
          <div>
            <strong>${p.name}</strong>
            <div class="small">Personalizada</div>
          </div>
          <div class="price">${brl(p.price)}</div>
        </div>
        <p class="card__desc muted">${p.desc}</p>
        <div class="card__actions">
          <button class="btn" data-add="${p.id}">Adicionar</button>
          <button class="btn btn--ghost" data-buy="${p.id}">Comprar no WhatsApp</button>
        </div>
      </div>
    </article>
  `).join("");

  // bind buttons
  elGrid.querySelectorAll("[data-add]").forEach(btn=>{
    btn.addEventListener("click", ()=> addToCart(btn.getAttribute("data-add")));
  });
  elGrid.querySelectorAll("[data-buy]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.getAttribute("data-buy");
      const p = PRODUCTS.find(x=>x.id===id);
      const msg = [
        "Olá! Quero comprar esta caneca na Gump Canecas ☕",
        "",
        `Produto: ${p.name}`,
        `Preço: ${brl(p.price)}`,
        "",
        "Observações (opcional):",
        "(Escreva aqui a personalização, nome/frase/foto/tema)"
      ].join("\n");
      openWhatsApp(msg);
    });
  });
}

function renderCart(){
  elCartCount.textContent = String(cartCount());
  elCartNotes.value = cartNotes;

  const entries = Object.entries(cart);
  if(entries.length === 0){
    elCartItems.innerHTML = `<div class="empty">Seu carrinho está vazio. Adicione uma caneca 🙂</div>`;
  }else{
    elCartItems.innerHTML = entries.map(([id,qty])=>{
      const p = PRODUCTS.find(x=>x.id===id);
      if(!p) return "";
      return `
        <div class="cart-item">
          <img src="${p.img}" alt="${p.name}">
          <div>
            <div class="cart-item__top">
              <div>
                <strong>${p.name}</strong>
                <div class="small muted">${brl(p.price)} • cada</div>
              </div>
              <button class="icon-btn" data-remove="${p.id}" aria-label="Remover">🗑️</button>
            </div>

            <div class="qty">
              <button data-dec="${p.id}" aria-label="Diminuir">−</button>
              <span>${qty}</span>
              <button data-inc="${p.id}" aria-label="Aumentar">+</button>
            </div>
          </div>
        </div>
      `;
    }).join("");

    // bind qty controls
    elCartItems.querySelectorAll("[data-inc]").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const id = btn.getAttribute("data-inc");
        setQty(id, (cart[id]||0)+1);
      });
    });
    elCartItems.querySelectorAll("[data-dec]").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const id = btn.getAttribute("data-dec");
        setQty(id, (cart[id]||0)-1);
      });
    });
    elCartItems.querySelectorAll("[data-remove]").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const id = btn.getAttribute("data-remove");
        setQty(id, 0);
      });
    });
  }

  elSubtotal.textContent = brl(cartSubtotal());
}

// Events
document.getElementById("cartOpen").addEventListener("click", ()=>{ renderCart(); openDrawer(); });
document.getElementById("cartClose").addEventListener("click", closeDrawer);
document.getElementById("drawerBackdrop").addEventListener("click", closeDrawer);
document.getElementById("btnOpenCartFromHero").addEventListener("click", ()=>{ renderCart(); openDrawer(); });

document.getElementById("clearCart").addEventListener("click", ()=>{
  if(confirm("Limpar o carrinho?")) clearCart();
});

document.getElementById("checkoutWhats").addEventListener("click", ()=>{
  if(cartCount() === 0){
    alert("Seu carrinho está vazio 🙂");
    return;
  }
  // persist notes
  cartNotes = elCartNotes.value || "";
  localStorage.setItem("gump_cart_notes", cartNotes);

  openWhatsApp(buildWhatsMessage());
});

document.getElementById("btnBudget").addEventListener("click", ()=>{
  const msg = [
    "Olá! Quero um orçamento de caneca personalizada ☕",
    "",
    "Quero fazer uma caneca do zero. Posso te mandar a ideia/foto e você me passa os valores e prazos?"
  ].join("\n");
  openWhatsApp(msg);
});

["btnWhatsHeader","btnWhatsFooter"].forEach(id=>{
  const el = document.getElementById(id);
  el.addEventListener("click", (e)=>{
    e.preventDefault();
    const msg = "Olá! Vim pela landing page da Gump Canecas ☕";
    openWhatsApp(msg);
  });
});

// Search/sort
elSearch.addEventListener("input", renderProducts);
elSort.addEventListener("change", renderProducts);

// Persist notes
elCartNotes.addEventListener("input", ()=>{
  cartNotes = elCartNotes.value || "";
  localStorage.setItem("gump_cart_notes", cartNotes);
});

renderProducts();
renderCart();
