document.addEventListener("DOMContentLoaded", function () {

    // products 불러오기 (localStorage)
    const products = JSON.parse(localStorage.getItem("products")) || [];
    const form = document.getElementById("product-form");
    const productList = document.getElementById("product-list");

    // 제품 목록 렌더링
    function renderProducts() {
        productList.innerHTML = "";
        products.forEach((product, index) => {
            const div = document.createElement("div");
            div.className = "production-product-item";
            div.innerHTML = `
                <strong>${product.name}</strong><br>
                ${product.description}<br>
                원가: ${product.originalPrice.toLocaleString()}원<br>
                판매가: ${product.salePrice.toLocaleString()}원<br>
                <img src="${product.image}" alt="${product.name}" style="width:150px;height:150px;object-fit:cover;"><br>
                <button onclick="deleteProduct(${index})">삭제</button>
                <hr>
            `;
            productList.appendChild(div);
        });
    }

    // 제품 삭제
    window.deleteProduct = function(index) {
        if (!confirm("정말 삭제하시겠습니까?")) return;
        products.splice(index, 1);
        localStorage.setItem("products", JSON.stringify(products));
        renderProducts();
    }

    // 제품 추가
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const fileInput = document.getElementById("product-image");
        const file = fileInput.files[0];

        if (!file) {
            alert("이미지를 선택해주세요.");
            return;
        }

        const reader = new FileReader();
        reader.onload = function (event) {
            // 이미지 로딩 후 canvas로 리사이즈
            const img = new Image();
            img.src = event.target.result;

            img.onload = function() {
                const canvas = document.createElement("canvas");
                const maxWidth = 500;   // 최대 너비
                const maxHeight = 500;  // 최대 높이
                let width = img.width;
                let height = img.height;

                // 비율 유지하며 크기 조정
                if(width > height) {
                    if(width > maxWidth){
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if(height > maxHeight){
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                const resizedDataUrl = canvas.toDataURL("image/jpeg", 0.8); // 품질 80%

                const newProduct = {
                    name: document.getElementById("product-name").value,
                    description: document.getElementById("product-desc").value,
                    originalPrice: Number(document.getElementById("product-original").value),
                    salePrice: Number(document.getElementById("product-sale").value),
                    image: resizedDataUrl // 리사이즈된 이미지 사용
                };

                products.push(newProduct);
                localStorage.setItem("products", JSON.stringify(products));
                renderProducts();
                form.reset();
            };
        };

        reader.readAsDataURL(file);
    });

    renderProducts();
});