const API_URL = "https://script.google.com/macros/s/AKfycbz-cJ_UjGe5r-W6veov8u5LpiwnQfVb8Vrvnscy6MAnu_zplMHj1Z_d34XgyDKlI5Kw1A/exec"; // 👈 여기에 본인 URL

const form = document.getElementById("product-form");
const productList = document.getElementById("product-list");

/* =========================
   안전 유틸
========================= */
function toNumber(value) {
    return Number(value) || 0;
}

/* =========================
   상품 등록
========================= */
form.addEventListener("submit", async function (e) {
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

        const imageBase64 = await readFileAsDataURL(imageFile);

        const product = {
            name,
            description: desc,
            originalPrice: toNumber(original),
            salePrice: toNumber(sale),
            image: imageBase64
        };

        const res = await fetch(API_URL + "?action=addProduct", {
            method: "POST",
            body: JSON.stringify(product)
        });

        const result = await res.text();

        console.log("등록 결과:", result);
        alert("상품 등록 완료!");

        form.reset();
        loadProducts();

    } catch (err) {
        console.error("상품 등록 오류:", err);
        alert("등록 실패");
    }
});


/* =========================
   파일 읽기 Promise화
========================= */
function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;

        reader.readAsDataURL(file);
    });
}


/* =========================
   상품 불러오기
========================= */
async function loadProducts() {
    try {
        const res = await fetch(API_URL + "?action=getProducts");
        const data = await res.json();

        renderProducts(data);

    } catch (err) {
        console.error("상품 불러오기 실패:", err);
        productList.innerHTML = "<p>데이터 로딩 실패</p>";
    }
}


/* =========================
   상품 렌더링
========================= */
function renderProducts(products = []) {

    productList.innerHTML = "";

    if (products.length === 0) {
        productList.innerHTML = "<p>등록된 상품이 없습니다</p>";
        return;
    }

    products.forEach(p => {

        const div = document.createElement("div");
        div.classList.add("product-item");

        div.innerHTML = `
            <img src="${p.image}" alt="${p.name} 상품 이미지">
            <h3>${p.name}</h3>
            <p>${p.description}</p>
            <p>원가: ${toNumber(p.originalPrice).toLocaleString()}</p>
            <p>판매가: ${toNumber(p.salePrice).toLocaleString()}</p>
        `;

        productList.appendChild(div);
    });
}


/* =========================
   초기 실행
========================= */
loadProducts();
