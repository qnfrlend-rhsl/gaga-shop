document.addEventListener("DOMContentLoaded", () => {

    const adminOrders = document.getElementById("admin-orders");
    if (!adminOrders) {
        console.error("admin-orders div 없음");
        return;
    }

    const API_URL = "https://script.google.com/macros/s/AKfycbz-cJ_UjGe5r-W6veov8u5LpiwnQfVb8Vrvnscy6MAnu_zplMHj1Z_d34XgyDKlI5Kw1A/exec";

    let orders = [];

    /* =========================
       주문 불러오기
    ========================= */
    function loadOrders() {
        fetch(API_URL + "?action=getOrders")
            .then(res => res.json())
            .then(data => {

                console.log("주문 데이터:", data);

                if (Array.isArray(data)) {
                    orders = data;
                } else if (Array.isArray(data?.data)) {
                    orders = data.data;
                } else if (Array.isArray(data?.result)) {
                    orders = data.result;
                } else {
                    console.error("알 수 없는 데이터 구조:", data);
                    orders = [];
                }

                renderAdminOrders();
            })
            .catch(err => console.log("주문 불러오기 실패:", err));
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
       렌더링
    ========================= */
    function renderAdminOrders() {
        adminOrders.innerHTML = "";

        orders.forEach(order => {

            let items = [];

            try {
                items = Array.isArray(order.items)
                    ? order.items
                    : JSON.parse(order.items || "[]");
            } catch {
                items = [];
            }

            // 🔥 핵심 수정: id 안전 처리
            const safeId = order.id || order.date;

            const div = document.createElement("div");
            div.classList.add("order-item");

            div.innerHTML = `
                <h3>${order.name || "이름 없음"}</h3>
                📅 ${order.date || "-"}<br>

                <ul>
                    ${items.map(item =>
                        `<li>${item.name} x ${item.qty}</li>`
                    ).join("")}
                </ul>

                📞 ${order.phone || "-"}<br>
                📍 ${order.address || "-"}<br>
                💰 ${(Number(order.total) || 0).toLocaleString()}원<br>

                📦 <span class="status-badge ${getStatusClass(order.status)}">
                    ${order.status || "결제대기"}
                </span>
                <br><br>
            `;

            /* =========================
               상태 버튼
            ========================= */
            ["결제대기", "결제완료", "배송준비중", "배송중", "배송완료"].forEach(status => {
                const btn = document.createElement("button");
                btn.textContent = status;
                btn.addEventListener("click", () => updateStatus(safeId, status));
                div.appendChild(btn);
            });

            /* =========================
               삭제 버튼
            ========================= */
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "삭제";
            deleteBtn.addEventListener("click", () => deleteOrder(safeId));
            div.appendChild(deleteBtn);

            div.appendChild(document.createElement("hr"));

            adminOrders.appendChild(div);
        });
    }

    /* =========================
       상태 변경
    ========================= */
    function updateStatus(id, status) {

        fetch(`${API_URL}?action=updateStatus&id=${encodeURIComponent(id)}&status=${encodeURIComponent(status)}`)
            .then(res => res.text())
            .then(res => {
                console.log("상태 변경:", res);
                loadOrders();
            })
            .catch(err => console.log("status error:", err));
    }

    /* =========================
       삭제
    ========================= */
    function deleteOrder(id) {

        fetch(API_URL + "?action=deleteOrder&id=" + encodeURIComponent(id))
            .then(res => res.text())
            .then(res => {
                console.log("삭제 응답:", res);
                loadOrders();
            })
            .catch(err => console.log("delete error:", err));
    }

    /* =========================
       초기 실행 + 자동갱신
    ========================= */
    loadOrders();
    setInterval(loadOrders, 5000);
});
