console.log("🟢 product-admin JS 실행됨");
document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("product-form");
    const productList = document.getElementById("product-list");

    const API_URL = "https://script.google.com/macros/s/AKfycbwbK4-VXVQ9Q8arK1PcCZVBbUqN7kXQxmY42VreIZTv1pDYx86cWLt358n8X3Z4cHA/exec";

    function renderProducts() {
        productList.innerHTML = "<p>👉 상품은 Google Sheets에서 관리됩니다</p>";
    }

    window.deleteProduct = function () {
        alert("삭제 기능은 Google Sheets 연동 후 가능합니다");
    }

    // 🚀 등록
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        console.log("🟡 submit 실행됨");

        const newProduct = {
            name: document.getElementById("product-name").value.trim(),
            description: document.getElementById("product-desc").value.trim(),
            originalPrice: Number(document.getElementById("product-original").value),
            salePrice: Number(document.getElementById("product-sale").value),

            // ⚠️ 이미지: file input → 일단 URL 방식으로 통일
            image: "https://picsum.photos/300/300"
        };

        console.log("🔵 전송 데이터:", newProduct);

        fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newProduct)
        })
        .then(async (res) => {
            const text = await res.text();
            console.log("🟢 Apps Script 응답:", text);
            return text;
        })
        .then(result => {
            alert("상품 등록 완료!");
            form.reset();
        })
        .catch(err => {
            console.error("🔴 등록 실패:", err);
            alert("등록 실패 (Apps Script 확인 필요)");
        });
    });

    renderProducts();
});
