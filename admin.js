const adminOrders = document.getElementById("admin-orders");

let orders = []; // ✅ localStorage 제거 → 서버 데이터로 변경

/* =========================
   주문 불러오기 (Google Sheets)
========================= */
function loadOrders() {

    fetch("https://opensheet.elk.sh/YOUR_SHEET_ID/orders")
        .then(res => res.json())
        .then(data => {

            console.log("주문 데이터:", data);

            orders = data || [];

            renderAdminOrders();
        })
        .catch(err => {
            console.log("주문 불러오기 실패:", err);
        });
}

/* =========================
   주문 렌더링 (기존 그대로 유지 + 안정성만 추가)
========================= */
function renderAdminOrders() {

    adminOrders.innerHTML = "";

    orders.forEach((order, index) => {

        const div = document.createElement("div");
        div.classList.add("order-item");

        div.innerHTML = `
            <h3>${order.name || "이름 없음"}</h3>
            📅 주문일: ${order.date || "날짜 정보 없음"}<br>

            <ul>
                ${(order.items || []).map(item => `
                    <li>${item.name} x ${item.qty}</li>
                `).join("")}
            </ul>

            📞 ${order.phone || ""}<br>
            📍 ${order.address || ""}<br>
            💰 ${(Number(order.total) || 0).toLocaleString()}원<br>
            📦 상태: <strong>${order.status || "결제대기"}</strong>

            <div>
                <button onclick="updateStatus(${index}, '결제대기')">결제대기</button>
                <button onclick="updateStatus(${index}, '결제완료')">결제완료</button>
                <button onclick="updateStatus(${index}, '배송준비중')">배송준비중</button>
                <button onclick="updateStatus(${index}, '배송중')">배송중</button>
                <button onclick="updateStatus(${index}, '배송완료')">배송완료</button>
                <button onclick="deleteOrder(${index})">삭제</button>
            </div>

            <hr>
        `;

        adminOrders.appendChild(div);
    });
}

/* =========================
   상태 변경 (임시 - localStorage 제거됨)
========================= */
function updateStatus(index, status) {

    orders[index].status = status;

    alert("⚠️ 현재는 화면용 변경입니다 (Google Sheets 반영은 다음 단계)");

    renderAdminOrders();
}

/* =========================
   삭제 (임시 - localStorage 제거됨)
========================= */
function deleteOrder(index) {

    orders.splice(index, 1);

    alert("⚠️ 현재는 화면용 삭제입니다 (Google Sheets 반영은 다음 단계)");

    renderAdminOrders();
}

/* =========================
   실행
========================= */
loadOrders();