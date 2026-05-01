console.log("JS 시작됨");

document.addEventListener("DOMContentLoaded", function () {
    console.log("JS 시작됨");

    /* =========================
       API URL
    ========================= */
    const API_URL = "https://script.google.com/macros/s/AKfycbzTvtByQBLt4tx0NSKWlFC1PTpy9-j4JIiHqoKAYjblLXlz1S9xw9gsvra1DmcrUoBqYQ/exec";

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
       상품생성
    ========================= */
    let products = [];

    fetch("https://opensheet.elk.sh/1XKQa35tuBMYaaucXvBf6YNw2F42EY584zSQFHYc8qfc/products")
        .then(res => res.json())
        .then(data => {
            products = data.map(p => ({
                id: String(p.id || p.name),
                name: p.name,
                description: p.description,
                originalPrice: Number(p.originalPrice),
                salePrice: Number(p.salePrice),
                image: p.image
            }));
            renderProducts();
        });

    /* =========================
       장바구니 상태
    ========================= */
    let cart = JSON.parse(localStorage.getItem("cart") || "[]");
    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    let selectedProduct = null;

    /* =========================
       장바구니 업데이트
    ========================= */
    function updateCart() {
        cartItems.innerHTML = "";

        let total = 0;

        // 장바구니 항목 갯수 및 가격 업데이트
        cart.forEach(item => {
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

            // 각 버튼에 이벤트 리스너 추가
            div.querySelector(".delete-btn").addEventListener("click", () => {
                removeProductFromCart(item.productId);
            });

            div.querySelector(".plus").addEventListener("click", () => {
                if (item.qty < 10) {
                    item.qty++;
                    updateCart();
                }
            });

            div.querySelector(".minus").addEventListener("click", () => {
                if (item.qty > 1) {
                    item.qty--;
                    updateCart();
                }
            });

            cartItems.appendChild(div);
        });

        cartTotal.textContent = `총합: ${total.toLocaleString()}원`;

        // 장바구니가 비어 있으면 localStorage에서 'cart' 항목 삭제
        if (cart.length > 0) {
            localStorage.setItem("cart", JSON.stringify(cart));
        } else {
            localStorage.removeItem("cart");
        }

        console.log("장바구니 UI 갱신 완료");
       
    }
    function removeProductFromCart(productId) {
    cart = cart.filter(item => String(item.productId) !== String(productId));
    updateCart();
}

    /* =========================
       상품리스트(표시, 출력)
    ========================= */
    function renderProducts() {
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

                const existing = cart.find(item => item.productId === String(product.id));
                if (existing) {
                    existing.qty++;
                } else {
                    cart.push({
                        productId: String(product.id),
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
       MODAL(팝업 창)
    ========================= */
    closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });

    modalCartBtn.addEventListener("click", () => {
        if (!selectedProduct) return;

        const existing = cart.find(item => item.productId === String(selectedProduct.id));

        if (existing) {
            existing.qty++;
        } else {
            cart.push({
                productId: String(selectedProduct.id),
                name: selectedProduct.name,
                price: selectedProduct.salePrice,
                qty: 1
            });
        }

        updateCart();
        modal.style.display = "none";
    });

    /* =========================
       CART TOGGLE(장바구니 닫기/열기)
    ========================= */
    let cartOpen = false;

    cartToggle.addEventListener("click", () => {
        cartOpen = !cartOpen;
        cartBox.classList.toggle("open", cartOpen);
    });

    /* =========================
      CLEAR CART(장바구니 비우기)
    ========================= */
    clearCartBtn.addEventListener("click", () => {
        cart = [];
        updateCart();

        localStorage.removeItem("cart");

        console.log("장바구니가 비워졌습니다.");  
        fetch(`${API_URL}?action=clearCart`)
            .then(res => res.text())
            .then(() => {
                console.log("서버에서 장바구니 초기화 처리 완료");
            })
            .catch(error => {
                console.error("서버 초기화 실패:", error);
            });
    });

    /* =========================
       PAY(결제)
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

    /* =========================
       ORDER (CREATE) 주문 생성
    ========================= */
    payConfirm.addEventListener("click", () => {
        const status = document.getElementById("order-status");
        status.textContent = "주문 대기 중...";

        setTimeout(() => {
            status.textContent = "주문 완료 ✔";
        }, 4000);

        const name = document.getElementById("buyer-name").value;
        const address = document.getElementById("buyer-address").value;
        const phone = document.getElementById("buyer-phone").value;
        const payMessage = document.getElementById("pay-message");

        if (!name || !address || !phone) {
            payMessage.textContent = "⚠️ 모든 정보를 입력해주세요.";
            return;
        }

        const orderId = Date.now(); 

        const cartWithStatus = cart.map(item => ({
            ...item,
            orderId: orderId,  
            status: "결제대기"
        }));

        const newOrder = {
            id: Date.now(),
            name,
            address,
            phone,
            items: cartWithStatus,
            total: cart.reduce((s, i) => s + i.price * i.qty, 0),
            status: "결제대기",
            date: new Date().toLocaleString()
        };

        fetch(`${API_URL}?action=createOrder&id=${newOrder.id}&name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}&address=${encodeURIComponent(address)}&items=${encodeURIComponent(JSON.stringify(cartWithStatus))}&total=${newOrder.total}&status=${newOrder.status}&date=${encodeURIComponent(newOrder.date)}`)

            .then(res => res.text())
            .then(() => {
                orders.push(newOrder);
                localStorage.setItem("orders", JSON.stringify(orders));

                cart = [];
                updateCart(); // 장바구니 갱신
                localStorage.removeItem("cart");

                payPanel.style.display = "none";
                renderOrders(); // 관리자 페이지 갱신
            });
    });

    /* =========================
       ORDERS RENDER(주문 목록)
    ========================= */
    function renderOrders() {
        orderHistory.innerHTML = "";

        orders.forEach(order => {
            const div = document.createElement("div");
            div.classList.add("order-item");

            div.innerHTML = `
                <strong>${order.name}</strong><br>
                📅 ${order.date}<br>
                🛍️ 상품 목록:<br> <div style="margin-left:10px;">${order.items?.map(item =>
                 `• ${item.name} x ${item.qty} (${item.price.toLocaleString()}원)`
                ).join("<br>") || "상품 없음"}</div><br>               
                📞${order.phone}<br>
                📍${order.address}<br>
                💰${order.total.toLocaleString()}원<br><br>
                📦<b>${order.status}</b><br><br>
            `;

            orderHistory.appendChild(div);
        });
    }

    renderOrders();

    /* =========================
       DRAG(마우스, 손가락 드레그)
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

    function syncOrderStatus() {
    fetch(API_URL + "?action=getOrders")
        .then(res => res.json())
        .then(serverOrders => {

            orders = serverOrders;

            syncCartStatusWithOrders();

            localStorage.setItem("orders", JSON.stringify(orders));
            renderOrders();
        });
}

    setInterval(syncOrderStatus, 2000);

    function updateOrderStatus(id, status) {
    fetch(`${API_URL}?action=updateStatus&id=${id}&status=${encodeURIComponent(status)}`)
        .then(res => res.text())
        .then(() => syncOrderStatus());
}
    function syncCartStatusWithOrders() {
    cart.forEach(cartItem => {

        orders.forEach(order => {
            const match = order.items.find(i =>
                String(i.productId) === String(cartItem.productId)
            );

            if (match) {
                cartItem.status = match.status;
            }
        });

    });

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCart();
}
    window.updateOrderStatus = updateOrderStatus;
});

