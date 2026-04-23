document.addEventListener("DOMContentLoaded", () => {

    const adminOrders = document.getElementById("admin-orders");
    if (!adminOrders) return;

   const API_URL = "https://script.google.com/macros/s/AKfycbz-cJ_UjGe5r-W6veov8u5LpiwnQfVb8Vrvnscy6MAnu_zplMHj1Z_d34XgyDKlI5Kw1A/exec";

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
       상태 변경 (추가 필요)
    ========================= */
    function updateStatus(id, status) {
    // ID를 숫자만 남기고 처리
    const cleanedId = String(id).replace(/\D/g, "");

    fetch(`${API_URL}?action=updateStatus&id=${encodeURIComponent(cleanedId)}&status=${encodeURIComponent(status)}`)
        .then(res => res.text())
        .then(res => {
            console.log("상태 변경:", res);
            loadOrders();
        })
        .catch(err => console.log("status error:", err));
}

    /* =========================
       삭제 (정상 1개만 유지)
    ========================= */
function deleteOrder(id) {
    // ID를 숫자만 남기고 처리
    const cleanedId = String(id).replace(/\D/g, "");

    fetch(API_URL + "?action=deleteOrder&id=" + encodeURIComponent(cleanedId))
        .then(res => res.text())
        .then(res => {
            console.log("삭제 응답:", res);
            loadOrders();
        })
        .catch(err => console.log("delete error:", err));
}
    
    loadOrders();
    setInterval(loadOrders, 3000);
});
