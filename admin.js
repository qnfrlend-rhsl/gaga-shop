document.addEventListener("DOMContentLoaded", () => {

    const adminOrders = document.getElementById("admin-orders");
    if (!adminOrders) return;

   const API_URL = "https://script.google.com/macros/s/AKfycbwcKwHPTWKTloJs9jlX4VFiFcxKWMwsCOZXqLzLXCG3gbJLz68FXxx0BAGnHkim8grBQA/exec";
   

    let orders = [];

    /* =========================
       주문 불러오기
    ========================= */
    function loadOrders() {
        fetch(API_URL + "?action=getOrders")
            .then(res => res.json())
            .then(data => {
                orders = data || [];
                renderAdminOrders();
            })
            .catch(err => console.log("load error:", err));
    }

    /* =========================
       주문 상태 색상 변경
    ========================= */
    function getStatusClass(status) {
    switch(status) {
        case "결제대기": return "status-pending";
        case "결제완료": return "status-paid";
        case "배송준비중": return "status-ready";
        case "배송중": return "status-shipping";
        case "배송완료": return "status-done";
        default: return "";
    }
}

    /* =========================
       렌더링
    ========================= */
    function renderAdminOrders() {
        adminOrders.innerHTML = "";

        orders.forEach((order) => {

            let items = [];
            try {
                items = typeof order.items === "string"
                    ? JSON.parse(order.items)
                    : order.items || [];
            } catch (e) {
                items = [];
            }

            const div = document.createElement("div");
            div.classList.add("order-item");

            div.innerHTML = `
                <h3>${order.name ?? "이름 없음"}</h3>
                📅 ${order.date ?? "-"}<br>
                <ul>
                    ${items.map(item => `<li>${item.name} x ${item.qty}</li>`).join("")}
                </ul>
                📞 ${order.phone ?? "-"}<br>
                📍 ${order.address ?? "-"}<br>
                💰 ${(order.total ? Number(order.total) : 0).toLocaleString()}원<br>
                📦 <span class="status-badge ${getStatusClass(order.status)}">
                    ${order.status || "결제대기"}
                      </span><br><br>
            `;

            /* 상태 버튼 */
            ["결제대기","결제완료","배송준비중","배송중","배송완료"].forEach(status => {
                const btn = document.createElement("button");
                btn.textContent = status;
                btn.addEventListener("click", () => updateStatus(order.id, status));
                div.appendChild(btn);
            });

            /* 삭제 버튼 */
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "삭제";
            deleteBtn.addEventListener("click", () => deleteOrder(order.id));
            div.appendChild(deleteBtn);

            div.appendChild(document.createElement("hr"));
            adminOrders.appendChild(div);
        });
    }

    /* =========================
       주문 상태 변경
    ========================= */
    function updateStatus(id, status) {
        const cleanedId = String(id).replace(/\D/g, "");

        fetch(`${API_URL}?action=updateStatus&id=${encodeURIComponent(cleanedId)}&status=${encodeURIComponent(status)}`)
            .then(res => res.text())
            .then(() => loadOrders())
            .catch(err => console.log("status error:", err));
    }

    /* =========================
       주문 삭제
    ========================= */
    function deleteOrder(id) {
        const cleanedId = String(id).replace(/\D/g, "");

        fetch(API_URL + "?action=deleteOrder&id=" + encodeURIComponent(cleanedId))
            .then(res => res.text())
            .then(() => loadOrders())
            .catch(err => console.log("delete error:", err));
    }

    loadOrders();
    setInterval(loadOrders, 3000);

    /* =========================
       상품 DOM
    ========================= */
    const productForm = document.getElementById("product-form");
    const productList = document.getElementById("product-list");

    /* =========================
       이미지 압축
    ========================= */
    function compressImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = function (event) {
                const img = new Image();

                img.onload = function () {
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");

                    let width = img.width;
                    let height = img.height;

                    const maxSize = 800;

                    if (width > height) {
                        if (width > maxSize) {
                            height *= maxSize / width;
                            width = maxSize;
                        }
                    } else {
                        if (height > maxSize) {
                            width *= maxSize / height;
                            height = maxSize;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    ctx.drawImage(img, 0, 0, width, height);

                    const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
                    resolve(compressedBase64);
                };

                img.onerror = reject;
                img.src = event.target.result;
            };

            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /* =========================
   상품 등록
========================= */
productForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    try {
        const name = document.getElementById("product-name").value.trim();
        const desc = document.getElementById("product-desc").value.trim();
        const original = document.getElementById("product-original").value;
        const sale = document.getElementById("product-sale").value;
        const imageFile = document.getElementById("product-image").files[0];

        if (!name || !desc || !imageFile) {
            alert("필수값을 입력하세요");
            return;
        }

        const imageBase64 = await compressImage(imageFile);

        const product = {
            name,
            description: desc,
            originalPrice: Number(original) || 0,
            salePrice: Number(sale) || 0,
            image: imageBase64
        };

        const url =
            `${API_URL}?action=addProduct` +
            `&name=${encodeURIComponent(name)}` +
            `&description=${encodeURIComponent(desc)}` +
            `&originalPrice=${encodeURIComponent(original)}` +
            `&salePrice=${encodeURIComponent(sale)}` +
            `&image=${encodeURIComponent(imageBase64)}`;

        const res = await fetch(url);
        const result = await res.text();

        console.log("등록 결과:", result);

        alert("상품 등록 완료!");

        productForm.reset();
        loadProducts();

    } catch (err) {
        console.error("상품 등록 오류:", err);
        alert("등록 실패");
    }
});


/* =========================
   상품 불러오기
========================= */
function loadProducts() {
    fetch("https://opensheet.elk.sh/1XKQa35tuBMYaaucXvBf6YNw2F42EY584zSQFHYc8qfc/시트1")
        .then(res => res.json())
        .then(data => {
            renderProducts(data);
        })
        .catch(err => console.log("상품 불러오기 실패:", err));
}


/* =========================
   상품 렌더링
========================= */
function renderProducts(products = []) {
    productList.innerHTML = "";

    products.forEach(product => {
        const div = document.createElement("div");
        div.classList.add("product-item");

        div.innerHTML = `
            <img 
                src="${product.image}"
                style="width:100px; height:100px; object-fit:cover; border-radius:8px;"
            >

            <h4>${product.name}</h4>
            <p>${product.description || ""}</p>

            <p>
                <span style="text-decoration:line-through; color:gray;">
                    ₩${Number(product.originalPrice || 0).toLocaleString()}
                </span>
            </p>

            <p style="color:red; font-weight:bold;">
                ₩${Number(product.salePrice || 0).toLocaleString()}
            </p>

            <hr>
        `;

        productList.appendChild(div);
    });
}

loadProducts();
});
