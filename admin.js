document.addEventListener("DOMContentLoaded", () => {

    const adminOrders = document.getElementById("admin-orders");
    const productForm = document.getElementById("product-form");
    const productList = document.getElementById("product-list");

    const searchInput = document.getElementById("order-search");
    const filterBar = document.getElementById("order-filter-bar");
    const productSearch = document.getElementById("product-search");

    if (!adminOrders) return;

    const API_URL = "https://script.google.com/macros/s/AKfycbzTvtByQBLt4tx0NSKWlFC1PTpy9-j4JIiHqoKAYjblLXlz1S9xw9gsvra1DmcrUoBqYQ/exec";

    let orders = [];
    let allProducts = [];   // 🔥 상품 전체 저장
    let editMode = false;
    let editId = null;
    let currentFilterName = null;
    let currentImageUrl = "";
    let lastData = "";

    /* =========================
       주문 불러오기
    ========================= */
    function loadOrders() {
    fetch(API_URL + "?action=getOrders")
        .then(res => res.json())
        .then(data => {

            const newData = JSON.stringify(data);

            if (newData === lastData) return; // 🔥 변경 없으면 중단

            lastData = newData;

            orders = (data || []).sort((a, b) => {
                return new Date(b.date) - new Date(a.date);
            });

            renderAdminOrders();
        })
        .catch(console.log);
}

    /* =========================
       상태 색상
    ========================= */
    function getStatusClass(status) {
        switch (status) {
            case "결제대기": return "status-pending";
            case "결제완료": return "status-paid";
            case "배송준비중": return "status-ready";
            case "배송중": return "status-shipping";
            case "배송완료": return "status-done";
            default: return "";
        }
    }

    /* =========================
       필터 바
    ========================= */
    function renderFilterBar(name) {
        if (!filterBar) return;

        filterBar.innerHTML = `
            <div style="
                display:inline-flex;
                align-items:center;
                gap:10px;
                padding:8px 12px;
                margin:10px 0;
                border:1px solid #e0e0e0;
                border-radius:8px;
                background:#f9fbff;
                font-size:14px;
            ">
                <span>🔎 필터: <b>${name}</b></span>
                <span id="reset-filter" style="cursor:pointer;color:#ff4d4f;">
                    ✕ 초기화
                </span>
            </div>
        `;

        document.getElementById("reset-filter").onclick = () => {
            currentFilterName = null;
            filterBar.innerHTML = "";
            renderAdminOrders(orders);
        };
    }

    /* =========================
       주문 렌더링
    ========================= */
    function renderAdminOrders(list = orders) {
    adminOrders.replaceChildren();

    // 🔥 성능 개선 핵심
    const fragment = document.createDocumentFragment();

    list.forEach(order => {

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
            <h3 class="customer-name" data-name="${order.name}" style="cursor:pointer;">
                ${order.name ?? "이름 없음"}
            </h3>

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

        ["결제대기", "결제완료", "배송준비중", "배송중", "배송완료"].forEach(status => {
            const btn = document.createElement("button");
            btn.textContent = status;
            btn.onclick = () => updateStatus(order.id, status);
            div.appendChild(btn);
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "삭제";
        deleteBtn.onclick = () => deleteOrder(order.id);
        div.appendChild(deleteBtn);

        // 🔥 기존 appendChild 대신 fragment로
        fragment.appendChild(div);
    });

    // 🔥 한 번만 DOM에 붙임
    adminOrders.appendChild(fragment);

    // =========================
    // 🔥 전체 주문 보기 버튼
    // =========================
    const resetBtn = document.createElement("div");

    resetBtn.textContent = "↩ 전체 주문 보기";

    resetBtn.onclick = () => {
        currentFilterName = null;
        if (filterBar) filterBar.innerHTML = "";
        renderAdminOrders(orders);
    };

    resetBtn.classList.add("reset-btn");

    resetBtn.style.display = "inline-block";
    resetBtn.style.padding = "6px 10px";
    resetBtn.style.margin = "10px 0";
    resetBtn.style.border = "1px solid #e0e0e0";
    resetBtn.style.borderRadius = "8px";
    resetBtn.style.background = "#fff";
    resetBtn.style.color = "#4a6cf7";
    resetBtn.style.cursor = "pointer";
    resetBtn.style.fontSize = "14px";

    adminOrders.appendChild(resetBtn);
}

    /* =========================
       고객 클릭
    ========================= */
    adminOrders.addEventListener("click", (e) => {

        if (e.target.classList.contains("customer-name")) {

            const name = e.target.dataset.name;

            currentFilterName = name;

            const grouped = orders.filter(o => o.name === name);

            renderAdminOrders(grouped);
            renderFilterBar(name);
        }
    });

    /* =========================
       고객 검색
    ========================= */
    searchInput.addEventListener("input", () => {

        const keyword = searchInput.value.trim().toLowerCase();

        if (!keyword) {
            renderAdminOrders(orders);
            return;
        }

        const filtered = orders.filter(order => {
            return (
                (order.name && order.name.toLowerCase().includes(keyword)) ||
                (order.phone && String(order.phone).includes(keyword))
            );
        });

        renderAdminOrders(filtered);
    });

    /* =========================
       🔥 상품 검색 (고객검색 동일 구조)
    ========================= */
    productSearch?.addEventListener("input", () => {

        const keyword = productSearch.value.trim().toLowerCase();

        if (!keyword) {
            renderProducts(allProducts);
            return;
        }

        const filtered = allProducts.filter(p => {
            return (
                (p.name && p.name.toLowerCase().includes(keyword)) ||
                (p.description && p.description.toLowerCase().includes(keyword))
            );
        });

        renderProducts(filtered);
    });

    /* =========================
       상태 변경
    ========================= */
    function updateStatus(id, status) {
        const cleanedId = String(id).replace(/\D/g, "");

        fetch(`${API_URL}?action=updateStatus&id=${cleanedId}&status=${encodeURIComponent(status)}`)
            .then(() => loadOrders())
            .catch(console.log);
    }

    /* =========================
       삭제
    ========================= */
    function deleteOrder(id) {
        const cleanedId = String(id).replace(/\D/g, "");

        fetch(API_URL + "?action=deleteOrder&id=" + cleanedId)
            .then(() => loadOrders())
            .catch(console.log);
    }

    loadOrders();

    /* =========================
       상품 업로드
    ========================= */
    async function uploadImage(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "product_upload");

    const res = await fetch("https://api.cloudinary.com/v1_1/damvkvip3/image/upload", {
        method: "POST",
        body: formData
    });

    const data = await res.json();
    return data.secure_url;
}

productForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
        const name = document.getElementById("product-name").value.trim();
        const desc = document.getElementById("product-desc").value.trim();
        const original = document.getElementById("product-original").value;
        const sale = document.getElementById("product-sale").value;
        const imageFile = document.getElementById("product-image").files[0];

        let imageUrl = currentImageUrl;

        if (imageFile) {
            imageUrl = await uploadImage(imageFile);
        }

        let url = "";

        // 🔥 수정 모드
        if (editMode) {
            url =
                `${API_URL}?action=updateProduct&id=${editId}` +
                `&name=${encodeURIComponent(name)}` +
                `&description=${encodeURIComponent(desc)}` +
                `&originalPrice=${encodeURIComponent(original)}` +
                `&salePrice=${encodeURIComponent(sale)}` +
                `&image=${encodeURIComponent(imageUrl)}`;

            // 수정 완료 후 상태 초기화
            editMode = false;
            editId = null;

        } 
        // 🔥 등록 모드
        else {
            url =
                `${API_URL}?action=addProduct` +
                `&name=${encodeURIComponent(name)}` +
                `&description=${encodeURIComponent(desc)}` +
                `&originalPrice=${encodeURIComponent(original)}` +
                `&salePrice=${encodeURIComponent(sale)}` +
                `&image=${encodeURIComponent(imageUrl)}`;
        }

        await fetch(url);

        productForm.reset();
        if (!editMode) {
        currentImageUrl = "";
        }

        editMode = false;
        editId = null;

        loadProducts();

    } catch (err) {
        console.log(err);
        alert("상품 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
});

    /* =========================
       상품 로드
    ========================= */
    function loadProducts() {
        fetch("https://opensheet.elk.sh/1XKQa35tuBMYaaucXvBf6YNw2F42EY584zSQFHYc8qfc/products")
            .then(res => res.json())
            .then(data => {
                allProducts = data || [];
                renderProducts(allProducts);
            })
            .catch(console.log);
    }

    function renderProducts(products = []) {
    productList.innerHTML = "";

    products.forEach(p => {

        const div = document.createElement("div");
        div.classList.add("product-item");

        div.innerHTML = `
            <img src="${p.image}" style="width:140px;height:100px;object-fit:cover;border-radius:8px;">

            <h4>${p.name}</h4>

            <p>${p.description || ""}</p>

            <div style="margin-top:6px;">
                <span style="text-decoration:line-through;color:#999;">
                    ${p.originalPrice ? Number(p.originalPrice).toLocaleString() + "원" : ""}
                </span>

                <b style="margin-left:6px;color:#ff4d4f;">
                    ${p.salePrice ? Number(p.salePrice).toLocaleString() + "원" : ""}
                </b>
            </div>
        `;
        div.onclick = () => {

    editMode = true;
    editId = p.id;

    document.getElementById("product-name").value = p.name;
    document.getElementById("product-desc").value = p.description;
    document.getElementById("product-original").value = p.originalPrice;
    document.getElementById("product-sale").value = p.salePrice;

    currentImageUrl = p.image;
}; 

        const deleteBtn = document.createElement("button");
deleteBtn.textContent = "삭제";
deleteBtn.style.marginLeft = "5px";

deleteBtn.onclick = (e) => {
    e.stopPropagation(); 
    if (!confirm("이 상품을 삭제할까요?")) return;

    fetch(`${API_URL}?action=deleteProduct&id=${p.id}`)
        .then(() => loadProducts())
        .catch(console.log);
};

div.appendChild(deleteBtn);

        productList.appendChild(div);
    });
}

    loadProducts();
});
