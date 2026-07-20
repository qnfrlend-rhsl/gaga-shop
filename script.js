console.log("JS 시작됨");

document.addEventListener("DOMContentLoaded", function () {
    console.log("JS 시작됨");

    /* =========================
       API URL
    ========================= */
    const API_URL = "https://script.google.com/macros/s/AKfycbxWzVYMJUxGxhltG24T4LdA3niwgJHqKnU5iWiIV7RdDht39xyS8vzardG47LaR46igKA/exec";

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
    const cartClose = document.getElementById("cart-close");

    /* =========================
       상품생성
    ========================= */
    let products = [];

    fetch("https://opensheet.elk.sh/1XKQa35tuBMYaaucXvBf6YNw2F42EY584zSQFHYc8qfc/products")
        .then(res => res.json())
        .then(data => {
            products = data.map(p => ({
                id: String(p.id || p.name),

                // 판매자 정보
                sellerName: p.sellerName,
                bank: p.bank,
                account: p.account,
                depositor: p.depositor,

                // 상품 정보
                name: p.name,
                description: p.description,
                originalPrice: Number(p.originalPrice),
                salePrice: Number(p.salePrice),
                image: p.image
            }));
            renderProducts();
            renderNewsTicker();
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
   뉴스 티커 생성
========================= */

function renderNewsTicker() {

    const ticker = document.getElementById("newsTicker");

    if (!ticker) return;

    let html = "";

    // 시작 안내
    html += `
    <span class="news">
        <span style="color:#FFD54F;">
            🚚 <strong>농축임수 센터에서 신선한 상품을 만나보세요 </strong>&gt;&gt;
        </span>
    </span>
    `;

    // 등록된 상품 자동 출력
    products.forEach(product => {

        html += `
            <span class="news">
                👉 ${product.name} 👨‍🌾 
                ${product.sellerName} |
                ${product.description}
                ${Number(product.salePrice).toLocaleString()}원 판매중!
            </span>
        `;

    });

    // 마지막 안내
    html += `
        <span class="event">
            🎉 신규 판매자 등록을 진행하고 있습니다 (관리자: 010 8429 5368).
        </span>
    `;

    ticker.innerHTML = html;
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

                        // 판매자 정보
                        sellerName: product.sellerName,
                        bank: product.bank,
                        account: product.account,
                        depositor: product.depositor,

                        // 상품 정보
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

                // 판매자 정보
                sellerName: selectedProduct.sellerName,
                bank: selectedProduct.bank,
                account: selectedProduct.account,
                depositor: selectedProduct.depositor,

                // 상품 정보
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

    cartClose.addEventListener("click", (e) => {
    e.stopPropagation();
    cartOpen = false;
    cartBox.classList.remove("open");
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
    // =========================
    // 총 금액 계산
    // =========================
    let total = 0;
    cart.forEach(item => {
        total += item.price * item.qty;
    });
    payTotal.textContent =
        `총 결제 금액: ${total.toLocaleString()}원`;
    // =========================
    // 판매자별 그룹 만들기
    // =========================
    const sellerGroup = {};
    cart.forEach(item => {
        const key = item.sellerName || "판매자 정보 없음";
        if (!sellerGroup[key]) {
            sellerGroup[key] = {

                sellerName: item.sellerName,
                bank: item.bank,
                account: item.account,
                depositor: item.depositor,
                items: []
            };
        }
        sellerGroup[key].items.push(item);
    });
    // =========================
    // 계좌 정보 출력
    // =========================
    const accountBox =
        document.getElementById("seller-account-list");
    accountBox.innerHTML = `
        <p style="color:#ff4d4f;">
        ⚠ 판매자가 다른 상품은 판매자별로 각각 입금해 주세요.
        </p>
    `;
    Object.values(sellerGroup).forEach(seller => {
        const sellerTotal = seller.items.reduce(
        (sum, item) => sum + (item.price * item.qty),
        0
        );
        const div = document.createElement("div");
        div.className = "seller-account-box";
        div.innerHTML = `
            <hr>
            <h4>👨‍🌾 판매자 : ${seller.sellerName}</h4>
            <p>
            🛒 상품<br>
            ${seller.items.map(item =>
                `- ${item.name} × ${item.qty}`
            ).join("<br>")}
            </p>
            <p>
            🏦 ${seller.bank}
            </p>
            <p>
            💳 ${seller.account}
            <button class="copy-account-btn">
                📋 복사
            </button>
            </p>
            <p>
            💰 입금 금액 :
            <b>${sellerTotal.toLocaleString()}원</b>
            </p>
            <p>
            예금주 : ${seller.depositor}<br>(택배 요청 시 배송비가 발생할 수 있어요.)
            </p>
        `;
        const copyBtn =
            div.querySelector(".copy-account-btn");
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(
                seller.account
            )
            .then(() => {
                alert(
                    "✅ 계좌번호가 복사되었습니다."
                );
            });
        };
        accountBox.appendChild(div);
    });
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
        const memo = document.getElementById("buyer-memo").value;
        const payMessage = document.getElementById("pay-message");

        if (!name || !address || !phone) {
            payMessage.textContent = "⚠️ 모든 정보를 입력해주세요.";
            return;
        }
        const cartWithStatus = cart.map(item => ({
            ...item, 
            status: "결제대기"
        }));

        // =========================
        // 판매자별 주문 분리 생성
        // =========================

        const sellerOrders = {};
        cartWithStatus.forEach(item => {
            const seller = item.sellerName || "판매자 정보 없음";
            if (!sellerOrders[seller]) {
                sellerOrders[seller] = [];
            }
            sellerOrders[seller].push(item);
        });


        const orderDate = new Date().toLocaleString();
        const requests = Object.entries(sellerOrders).map(([seller, items]) => {
            const orderId = Date.now() + Math.floor(Math.random() * 1000);
            const total = items.reduce(
                (sum, item) => sum + (item.price * item.qty),
                0
            );
            return fetch(
                `${API_URL}?action=createOrder` +
                `&id=${orderId}` +
                `&name=${encodeURIComponent(name)}` +
                `&phone=${encodeURIComponent(phone)}` +
                `&address=${encodeURIComponent(address)}` +
                `&memo=${encodeURIComponent(memo)}` +
                `&items=${encodeURIComponent(JSON.stringify(items))}` +
                `&total=${total}` +
                `&status=결제대기` +
                `&date=${encodeURIComponent(orderDate)}`
            );
        });
        Promise.all(requests)
        .then(() => {
            cart = [];
            updateCart();
            localStorage.removeItem("cart");
            payPanel.style.display = "none";
        });
    });

    /* =========================
       ORDERS RENDER(주문 목록)
    ========================= */
    /*
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
*/
    // renderOrders();

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

    /*

    function syncOrderStatus() {
    fetch(API_URL + "?action=getOrders")
        .then(res => res.json())
        .then(serverOrders => {

            orders = serverOrders;

            syncCartStatusWithOrders();

            localStorage.setItem("orders", JSON.stringify(orders));
            // renderOrders();
        });
}

    setInterval(syncOrderStatus, 10000);
    */

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

document.getElementById("order-search-btn").addEventListener("click", async () => {

    const keyword = document.getElementById("order-search-input").value.trim();

    if (!keyword) {
        alert("이름 또는 전화번호를 입력하세요");
        return;
    }

    const res = await fetch(API_URL + "?action=getOrders");
    const orders = await res.json();

    const filtered = orders.filter(order =>
        (order.name && order.name.toLowerCase().includes(keyword.toLowerCase())) ||
        (order.phone && String(order.phone).includes(keyword))
    );

    const box = document.getElementById("order-result");
    box.innerHTML = "";

    if (filtered.length === 0) {
        box.innerHTML = "📭 주문 내역이 없습니다";
        return;
    }

    filtered.forEach(order => {
        const div = document.createElement("div");
        div.classList.add("order-item");
        div.style.marginTop = "8px";

        div.innerHTML = `
            <strong>${order.name}</strong><br>
            📅 ${order.date}<br>
            🛍️ ${order.items?.map(item =>
                `${item.name} x ${item.qty}`
            ).join(", ") || "상품 없음"}<br>
            📞 ${order.phone}<br>
            📍 ${order.address}<br>
            💰 ${Number(order.total).toLocaleString()}원<br>
            📦 ${order.status}
        `;

        box.appendChild(div);
    });
});

document.getElementById("order-search-input")
.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        document.getElementById("order-search-btn").click();
    }
});

});

