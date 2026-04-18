console.log("JS 시작됨");
    document.addEventListener("DOMContentLoaded", function () {

    console.log("JS 시작됨");

    document.addEventListener("click", () => {
        console.log("클릭 감지됨");

    // 기존 코드 계속...
});

    /* =========================
       DOM
    ========================= */
    const productList = document.querySelector(".product-list");

    const cartItems = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");
    const clearCartBtn = document.getElementById("clear-cart");

    const payBtn = document.querySelector(".pay-btn");
    const payPanel = document.getElementById("pay-panel");
    const payTotal = document.getElementById("pay-total");
    const payConfirm = document.getElementById("pay-confirm");
    const payClose = document.getElementById("pay-close");
    const orderHistory = document.getElementById("order-history");

    const cartBox = document.querySelector(".cart-box");
    const cartToggle = document.getElementById("cart-toggle");
    const modal = document.getElementById("modal");
    const modalImg = document.getElementById("modal-img");
    const modalTitle = document.getElementById("modal-title");
    const modalDesc = document.getElementById("modal-desc");
    const modalPrice = document.getElementById("modal-price");
    const modalCartBtn = document.getElementById("modal-cart-btn");
    const closeBtn = document.querySelector(".close");
    

    /* =========================
       PRODUCTS (GOOGLE SHEETS)
    ========================= */
let products = [];
console.log("fetch 시작 전");
fetch("https://opensheet.elk.sh/1XKQa35tuBMYaaucXvBf6YNw2F42EY584zSQFHYc8qfc/시트1")
    .then(res => res.json())
    .then(data => {

        console.log("데이터:", data);

        products = data.map(p => ({
            name: p.name,
            description: p.description,
            originalPrice: Number(p.originalPrice),
            salePrice: Number(p.salePrice),
            image: p.image
        }));

        console.log("products:", products);

        renderProducts();
    })
    .catch(err => {
        console.log("에러:", err);
    });

    /* =========================
       CART STATE
    ========================= */
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    let selectedProduct = null;

    /* =========================
       CART UPDATE
    ========================= */
    function updateCart() {

        cartItems.innerHTML = "";

        let total = 0;

        cart.forEach((item, index) => {

            total += item.price * item.qty;

            const div = document.createElement("div");
            div.classList.add("cart-item");

            div.innerHTML = `
                <span>${item.name}</span>

                <div>
                    <button class="minus">-</button>
                    <span>${item.qty}</span>
                    <button class="plus">+</button>
                </div>

                <span>${(item.price * item.qty).toLocaleString()}원</span>

                <button class="delete-btn">삭제</button>
            `;

            div.querySelector(".delete-btn").addEventListener("click", () => {
                cart.splice(index, 1);
                updateCart();
            });

            div.querySelector(".plus").addEventListener("click", () => {
                if (item.qty >= 10) return;
                item.qty++;
                updateCart();
            });

            div.querySelector(".minus").addEventListener("click", () => {
                if (item.qty > 1) item.qty--;
                updateCart();
            });

            cartItems.appendChild(div);
        });

        cartTotal.textContent = `총합: ${total.toLocaleString()}원`;

        localStorage.setItem("cart", JSON.stringify(cart));
    }

    updateCart();

    /* =========================
       PRODUCTS RENDER
    ========================= */
function renderProducts() {

    console.log("렌더 시작 products:", products);
    console.log("productList:", productList);

    productList.innerHTML = "";

    products.forEach(product => {

        const price1 = Number(product.originalPrice || 0);
        const price2 = Number(product.salePrice || 0);

        const productItem = document.createElement("div");
        productItem.classList.add("product-item");

        productItem.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.description || ""}</p>

            <p class="price">
                <span class="original">₩${price1.toLocaleString()}</span>
                <span class="sale">₩${price2.toLocaleString()}</span>
            </p>

            <button class="cart-btn">장바구니</button>
        `;

        productItem.addEventListener("click", () => {
            modal.style.display = "block";
            modalImg.src = product.image;
            modalTitle.textContent = product.name;
            modalDesc.textContent = product.description;
            modalPrice.textContent = `₩${price2.toLocaleString()}`;
            selectedProduct = product;
        });

        productItem.querySelector(".cart-btn").addEventListener("click", (e) => {
            e.stopPropagation();

            const existing = cart.find(item => item.name === product.name);

            if (existing) {
                existing.qty++;
            } else {
                cart.push({
                    name: product.name,
                    price: price2,
                    qty: 1
                });
            }

            updateCart();
        });

        productList.appendChild(productItem);
    });
}
    /* =========================
       MODAL
    ========================= */
    closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });

    modalCartBtn.addEventListener("click", () => {

        if (!selectedProduct) return;

        const existing = cart.find(item => item.name === selectedProduct.name);

        if (existing) {
            existing.qty++;
        } else {
            cart.push({
                name: selectedProduct.name,
                price: selectedProduct.salePrice,
                qty: 1
            });
        }

        updateCart();
        modal.style.display = "none";
    });

    /* =========================
       CART TOGGLE
    ========================= */
    let cartOpen = false;

    cartToggle.addEventListener("click", () => {
        cartOpen = !cartOpen;
        cartBox.classList.toggle("open", cartOpen);
    });

    /* =========================
       CLEAR CART
    ========================= */
    clearCartBtn.addEventListener("click", () => {
        cart = [];
        updateCart();
        localStorage.removeItem("cart");
    });

    /* =========================
       PAY
    ========================= */
    payBtn.addEventListener("click", () => {

        if (cart.length === 0) {
            alert("장바구니가 비어있습니다.");
            return;
        }

        let total = 0;
        cart.forEach(item => {
            total += item.price * item.qty;
        });

        payTotal.textContent = `총 결제 금액: ${total.toLocaleString()}원`;

        payPanel.style.display = "block";
    });

    payClose.addEventListener("click", () => {
        payPanel.style.display = "none";
    });


payConfirm.addEventListener("click", () => {

    const name = document.getElementById("buyer-name").value;
    const address = document.getElementById("buyer-address").value;
    const phone = document.getElementById("buyer-phone").value;

    const payMessage = document.getElementById("pay-message");
    const orderStatus = document.getElementById("order-status");

    if (!name || !address || !phone) {
        payMessage.textContent = "⚠️ 모든 정보를 입력해주세요.";
        return;
    }

    payMessage.textContent = "🎉 주문이 완료되었습니다!";

    const newOrder = {
        id: Date.now(),
        name,
        address,
        phone,
        items: [...cart],
        total: cart.reduce((sum, item) => sum + item.price * item.qty, 0),
        status: "결제대기",
        date: new Date().toLocaleString() 
    };

    fetch("https://script.google.com/macros/s/AKfycbzxUWtw67kPooppyyzrJzOv6Sv5TxVXujk5uWRx_D1kFLpUXN3dPJFFis6yKO6GF_aPWA/exec", {
    method: "POST",
    body: JSON.stringify(newOrder)
    });

    orders.push(newOrder);
    localStorage.setItem("orders", JSON.stringify(orders));
    renderOrders();

    orderStatus.textContent = "🟡 결제 대기중입니다";

    setTimeout(() => {
        orderStatus.textContent = "🚚 배송 준비중입니다";

        setTimeout(() => {
            orderStatus.textContent = "📦 배송 중";
        }, 10000);

    }, 10000);

    cart = [];
    updateCart();
    localStorage.removeItem("cart");

    setTimeout(() => {
        payPanel.style.display = "none";
        payMessage.textContent = "";
    }, 5000);

});

function renderOrders() {

    orderHistory.innerHTML = "";

    orders.forEach((order, index) => {

        const div = document.createElement("div");
        div.classList.add("order-item");

        div.innerHTML = `
            <strong>${order.name}</strong><br>
            📅 주문일: ${order.date || "날짜 정보 없음"}<br>

            <ul>
                ${order.items.map(item => `
                    <li>${item.name} x ${item.qty} (₩${item.price.toLocaleString()})</li>
                `).join("")}
            </ul>

            📞 ${order.phone}<br>
            📍 ${order.address}<br>
            💰 총액: ${order.total.toLocaleString()}원<br>
            📦 상태: <span class="status ${order.status}">${order.status}</span>

        `;

        orderHistory.appendChild(div);
    });
}



renderOrders();

    /* =========================
       🖱️ 드래그 기능 (추가된 부분)
    ========================= */
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    cartBox.addEventListener("mousedown", (e) => {
        isDragging = true;

        offsetX = e.clientX - cartBox.offsetLeft;
        offsetY = e.clientY - cartBox.offsetTop;

        cartBox.style.cursor = "grabbing";
    });

    document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;

        cartBox.style.left = (e.clientX - offsetX) + "px";
        cartBox.style.top = (e.clientY - offsetY) + "px";
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
        cartBox.style.cursor = "grab";
    });


});