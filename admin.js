document.addEventListener("DOMContentLoaded", () => {

    const adminOrders = document.getElementById("admin-orders");
    const productForm = document.getElementById("product-form");
    const productList = document.getElementById("product-list");

    if (!adminOrders) return;

    const API_URL = "https://script.google.com/macros/s/AKfycbzTvtByQBLt4tx0NSKWlFC1PTpy9-j4JIiHqoKAYjblLXlz1S9xw9gsvra1DmcrUoBqYQ/exec";

    let orders = [];
    let editMode = false;
    let editId = null;

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
       주문 렌더링
    ========================= */
    function renderAdminOrders() {
        adminOrders.innerHTML = "";

        orders.forEach(order => {

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

            div.appendChild(document.createElement("hr"));
            adminOrders.appendChild(div);
        });
    }

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
    setInterval(loadOrders, 20000);

    /* =========================
       CLOUDINARY 업로드
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

    /* =========================
       상품 등록 / 수정
    ========================= */
    productForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        try {
            const name = document.getElementById("product-name").value.trim();
            const desc = document.getElementById("product-desc").value.trim();
            const original = document.getElementById("product-original").value;
            const sale = document.getElementById("product-sale").value;
            const imageFile = document.getElementById("product-image").files[0];

            if (!name || !desc) {
                alert("필수값 입력");
                return;
            }

            let imageUrl = "";

            if (imageFile) {
                imageUrl = await uploadImage(imageFile);
            }

            // 수정 모드
            if (editMode) {
                const url =
                    `${API_URL}?action=updateProduct` +
                    `&id=${editId}` +
                    `&name=${encodeURIComponent(name)}` +
                    `&description=${encodeURIComponent(desc)}` +
                    `&originalPrice=${encodeURIComponent(original)}` +
                    `&salePrice=${encodeURIComponent(sale)}` +
                    `&image=${encodeURIComponent(imageUrl)}`;

                await fetch(url);

                editMode = false;
                editId = null;

                productForm.reset();
                loadProducts();
                return;
            }

            // 등록
            const url =
                `${API_URL}?action=addProduct` +
                `&name=${encodeURIComponent(name)}` +
                `&description=${encodeURIComponent(desc)}` +
                `&originalPrice=${encodeURIComponent(original)}` +
                `&salePrice=${encodeURIComponent(sale)}` +
                `&image=${encodeURIComponent(imageUrl)}`;

            await fetch(url);

            alert("상품 등록 완료");

            productForm.reset();
            loadProducts();

        } catch (err) {
            console.log(err);
            alert("등록 실패");
        }
    });

    /* =========================
       상품 수정 버튼
    ========================= */
    function editProduct(p) {
        document.getElementById("product-name").value = p.name;
        document.getElementById("product-desc").value = p.description;
        document.getElementById("product-original").value = p.originalPrice;
        document.getElementById("product-sale").value = p.salePrice;

        editMode = true;
        editId = p.id;
    }

    /* =========================
       상품 삭제
    ========================= */
    function deleteProduct(id) {
    fetch(API_URL + "?action=deleteProduct&id=" + encodeURIComponent(String(id)))
        .then(res => res.text())
        .then(res => {
            console.log("삭제결과:", res);
            loadProducts();
        })
        .catch(console.log);
}

    /* =========================
       상품 불러오기
    ========================= */
    function loadProducts() {
        fetch("https://opensheet.elk.sh/1XKQa35tuBMYaaucXvBf6YNw2F42EY584zSQFHYc8qfc/products")
            .then(res => res.json())
            .then(renderProducts)
            .catch(console.log);
    }

    /* =========================
       상품 렌더링 (버튼 위치 수정됨)
    ========================= */
    function renderProducts(products = []) {
        productList.innerHTML = "";

        products.forEach(p => {

            const div = document.createElement("div");
            div.classList.add("product-item");

            const editBtn = document.createElement("button");
            editBtn.textContent = "수정";
            editBtn.onclick = () => editProduct(p);

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "삭제";
            const getId = (p) => p.id || p.ID || p.Id || Object.values(p)[0];
            deleteBtn.onclick = () => deleteProduct(getId(p));

            div.innerHTML = `
                <img src="${p.image}" style="width:100px;height:100px;object-fit:cover;border-radius:8px;">
                <h4>${p.name}</h4>
                <p>${p.description || ""}</p>

                <p style="text-decoration:line-through;color:gray;">
                    ₩${Number(p.originalPrice || 0).toLocaleString()}
                </p>

                <p style="color:red;font-weight:bold;">
                    ₩${Number(p.salePrice || 0).toLocaleString()}
                </p>
            `;

            // 🔥 버튼은 밖에서 넣어서 문제 해결
            div.appendChild(editBtn);
            div.appendChild(deleteBtn);

            div.appendChild(document.createElement("hr"));

            productList.appendChild(div);
        });
    }

    loadProducts();
});
