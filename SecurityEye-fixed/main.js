(() => {
  "use strict";

  const products = [
    { id: 1, title: "Hikvision 4MP Dome", price: 129.99, oldPrice: 162.49, discount: "-20%", category: "dome", image: "images/camera1.jpg", images: ["images/camera1.jpg","images/camera2.jpg","images/camera3.jpg","images/camera4.jpg"], desc: "4MP dome camera for clear indoor and outdoor monitoring." },
    { id: 2, title: "Dahua 5MP Bullet", price: 149.99, oldPrice: 176.46, discount: "-15%", category: "bullet", image: "images/camera2.jpg", images: ["images/camera2.jpg","images/camera1.jpg","images/camera3.jpg","images/camera4.jpg"], desc: "5MP bullet camera designed for dependable perimeter security." },
    { id: 3, title: "Axis PTZ Network", price: 899.99, oldPrice: 1199.99, discount: "-25%", category: "ptz", image: "images/camera3.jpg", images: ["images/camera3.jpg","images/camera1.jpg","images/camera2.jpg","images/camera4.jpg"], desc: "PTZ network camera with flexible pan, tilt and zoom coverage." },
    { id: 4, title: "Ring Stick Up Cam", price: 89.99, oldPrice: 99.99, discount: "-10%", category: "wireless", image: "images/camera4.jpg", images: ["images/camera4.jpg","images/camera1.jpg","images/camera2.jpg","images/camera3.jpg"], desc: "Convenient wireless camera for everyday smart monitoring." },
    { id: 5, title: "Lorex 4K Dome", price: 199.99, oldPrice: 243.89, discount: "-18%", category: "dome", image: "images/camera5.jpg", images: ["images/camera5.jpg","images/camera1.jpg","images/camera2.jpg","images/camera3.jpg"], desc: "4K dome camera delivering detailed high-resolution footage." },
    { id: 6, title: "Reolink RLC-810A", price: 69.99, oldPrice: 99.99, discount: "-30%", category: "bullet", image: "images/camera6.jpg", images: ["images/camera6.jpg","images/camera1.jpg","images/camera2.jpg","images/camera3.jpg"], desc: "PoE security camera for reliable, continuous surveillance." },
    { id: 7, title: "Arlo Pro 4", price: 175.99, oldPrice: 199.99, discount: "-12%", category: "wireless", image: "images/camera7.jpg", images: ["images/camera7.jpg","images/camera1.jpg","images/camera2.jpg","images/camera3.jpg"], desc: "Wireless smart camera for flexible home protection." },
    { id: 8, title: "Bosch AUTODOME", price: 1249.99, oldPrice: 1602.55, discount: "-22%", category: "ptz", image: "images/camera8.jpg", images: ["images/camera8.jpg","images/camera1.jpg","images/camera2.jpg","images/camera3.jpg"], desc: "Professional PTZ dome camera for wide-area monitoring." }
  ];

  const $ = id => document.getElementById(id);
  const money = value => "$" + Number(value).toFixed(2);

  function readStorage(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value == null ? fallback : value;
    } catch (_) { return fallback; }
  }
  function getCart() {
    const raw = readStorage("cart", []);
    return Array.isArray(raw) ? raw.filter(x => x && Number.isInteger(Number(x.id)) && Number(x.qty) > 0)
      .map(x => ({ id: Number(x.id), qty: Math.min(99, Math.max(1, Number(x.qty) || 1)) })) : [];
  }
  function saveCart(cart) {
    try { localStorage.setItem("cart", JSON.stringify(cart)); } catch (_) {}
    updateCartCount();
  }
  function updateCartCount() {
    const count = getCart().reduce((sum, item) => sum + item.qty, 0);
    document.querySelectorAll("#cart-count, #cartCount").forEach(el => { el.textContent = count; });
  }
  let toastTimer;
  function showToast(message) {
    let toast = $("toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "toast";
      toast.setAttribute("role", "status");
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    Object.assign(toast.style, {
      position: "fixed", bottom: "22px", right: "22px", maxWidth: "min(90vw, 360px)",
      background: "#123b3b", color: "#fff", padding: "13px 18px", borderRadius: "12px",
      fontSize: "14px", zIndex: "10000", boxShadow: "0 10px 30px rgba(0,0,0,.2)",
      opacity: "1", transform: "translateY(0)", transition: "opacity .2s, transform .2s"
    });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.style.opacity = "0"; toast.style.transform = "translateY(10px)"; }, 2400);
  }

  function addToCart(id) {
    const product = products.find(p => p.id === Number(id));
    if (!product) return;
    const cart = getCart();
    const item = cart.find(i => i.id === product.id);
    if (item) item.qty = Math.min(99, item.qty + 1);
    else cart.push({ id: product.id, qty: 1 });
    saveCart(cart);
    showToast(product.title + " added to cart");
  }
  function addFromDetail() {
    const product = readStorage("selectedProduct", null);
    if (!product || !products.some(p => p.id === Number(product.id))) {
      showToast("Please select a product first.");
      return;
    }
    const qtyInput = $("qty");
    const amount = Math.min(99, Math.max(1, parseInt(qtyInput?.value, 10) || 1));
    const cart = getCart();
    const item = cart.find(i => i.id === Number(product.id));
    if (item) item.qty = Math.min(99, item.qty + amount);
    else cart.push({ id: Number(product.id), qty: amount });
    saveCart(cart);
    showToast(product.title + " added to cart");
  }
  function showCart() {
    const cart = getCart();
    if (!cart.length) { showToast("Your cart is empty."); return; }
    const lines = cart.map(item => {
      const p = products.find(x => x.id === item.id);
      return p ? `${p.title} × ${item.qty}` : "";
    }).filter(Boolean);
    const total = cart.reduce((sum, item) => {
      const p = products.find(x => x.id === item.id);
      return sum + (p ? p.price * item.qty : 0);
    }, 0);
    showToast(`${lines.join(" • ")} | Total: ${money(total)}`);
  }

  function renderProducts(filter = "all", query = "") {
    const box = $("products");
    if (!box) return;
    const q = query.trim().toLowerCase();
    const visible = products.filter(p =>
      (filter === "all" || p.category === filter) &&
      (!q || `${p.title} ${p.category} ${p.desc}`.toLowerCase().includes(q))
    );
    if (!visible.length) {
      box.innerHTML = '<div class="empty-state"><h3>No products found</h3><p>Try another search term or category.</p></div>';
      return;
    }
    box.innerHTML = visible.map(p => `
      <article class="card">
        <img src="${p.image}" alt="${p.title}" loading="lazy">
        <div class="body">
          <span class="tag">${p.category}</span>
          <h3>${p.title}</h3>
          <div class="price">${money(p.price)} <s>${money(p.oldPrice)}</s> <span class="badge">${p.discount}</span></div>
          <div class="buttons">
            <button class="btn-primary" type="button" data-add="${p.id}">Add to Cart</button>
            <button class="btn-secondary" type="button" data-details="${p.id}">View Details</button>
          </div>
        </div>
      </article>`).join("");
  }

  function viewDetails(id) {
    const product = products.find(p => p.id === Number(id));
    if (!product) return;
    try { localStorage.setItem("selectedProduct", JSON.stringify(product)); } catch (_) {}
    location.href = "product-details.html";
  }
  function loadDetails() {
    const selected = readStorage("selectedProduct", null);
    const product = products.find(p => selected && p.id === Number(selected.id));
    if (!product) {
      const info = document.querySelector(".info");
      if (info) info.innerHTML = '<h1>Product not found</h1><p>Please return to the products page and choose an item.</p><a class="back" href="products.html">Browse products</a>';
      return;
    }
    $("main-img").src = product.images[0];
    $("main-img").alt = product.title;
    $("title").textContent = product.title;
    $("price").textContent = money(product.price);
    $("old-price").textContent = money(product.oldPrice);
    $("discount").textContent = product.discount;
    $("desc").textContent = product.desc;
    $("category").textContent = product.category;
    $("thumbs").innerHTML = product.images.map((img, i) =>
      `<img src="${img}" alt="${product.title} view ${i + 1}" class="${i === 0 ? "active" : ""}" data-image="${img}">`
    ).join("");
  }
  function changeQty(change) {
    const input = $("qty");
    if (!input) return;
    input.value = Math.min(99, Math.max(1, (parseInt(input.value, 10) || 1) + change));
  }

  document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    const productBox = $("products");
    if (productBox) {
      const params = new URLSearchParams(location.search);
      const initialSearch = params.get("search") || "";
      let activeFilter = "all";
      renderProducts(activeFilter, initialSearch);
      document.querySelectorAll(".filters button").forEach(button => {
        button.addEventListener("click", () => {
          activeFilter = button.dataset.filter || "all";
          document.querySelectorAll(".filters button").forEach(b => b.classList.toggle("active", b === button));
          renderProducts(activeFilter, $("productSearch")?.value || initialSearch);
        });
      });
      productBox.addEventListener("click", event => {
        const add = event.target.closest("[data-add]");
        const details = event.target.closest("[data-details]");
        if (add) addToCart(add.dataset.add);
        if (details) viewDetails(details.dataset.details);
      });
      const search = $("productSearch");
      if (search) {
        search.value = initialSearch;
        search.addEventListener("input", () => renderProducts(activeFilter, search.value));
      }
    }
    if ($("main-img")) loadDetails();

    $("cartIcon")?.addEventListener("click", showCart);
    $("thumbs")?.addEventListener("click", event => {
      const thumb = event.target.closest("[data-image]");
      if (!thumb) return;
      $("main-img").src = thumb.dataset.image;
      document.querySelectorAll("#thumbs img").forEach(img => img.classList.toggle("active", img === thumb));
    });

    const searchIcon = $("searchIcon"), searchBox = $("searchBox");
    const searchInput = document.querySelector("#searchBox input");
    const loginIcon = $("loginIcon"), loginMenu = $("loginMenu");
    const closeMenus = () => { searchBox?.classList.remove("active"); loginMenu?.classList.remove("active"); };
    searchIcon?.addEventListener("click", event => {
      event.stopPropagation(); loginMenu?.classList.remove("active");
      searchBox?.classList.toggle("active");
      if (searchBox?.classList.contains("active")) searchInput?.focus();
    });
    loginIcon?.addEventListener("click", event => {
      event.stopPropagation(); searchBox?.classList.remove("active");
      loginMenu?.classList.toggle("active");
    });
    searchBox?.addEventListener("click", event => event.stopPropagation());
    loginMenu?.addEventListener("click", event => event.stopPropagation());
    document.addEventListener("click", closeMenus);
    searchInput?.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        const term = searchInput.value.trim();
        location.href = "products.html" + (term ? "?search=" + encodeURIComponent(term) : "");
      }
      if (event.key === "Escape") closeMenus();
    });
  });

  // Keep the existing inline handlers used by the product details page.
  window.addToCart = addToCart;
  window.addFromDetail = addFromDetail;
  window.qty = changeQty;
  window.viewDetails = viewDetails;
})();
