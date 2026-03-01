let products = JSON.parse(localStorage.getItem("products")) || [];
let sales = JSON.parse(localStorage.getItem("sales")) || [];

document.getElementById("search").addEventListener("input", function() {
    const searchText = this.value.toLowerCase();
    filterProducts(searchText);
});

function filterProducts(searchText) {
    const rows = document.querySelectorAll("#productTable tr");

    rows.forEach(row => {
        const nameCell = row.children[1].textContent.toLowerCase();

        if (nameCell.includes(searchText)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
}

function saveData() {
    localStorage.setItem("products", JSON.stringify(products));
    localStorage.setItem("sales", JSON.stringify(sales));
}

function addProduct() {
    const name = document.getElementById("name").value;
    const price = parseFloat(document.getElementById("price").value);
    const quantity = parseInt(document.getElementById("quantity").value);
    const composition = document.getElementById("composition").value;
    const photoInput = document.getElementById("photo");

    const reader = new FileReader();
    reader.onload = function() {
        const product = {
            id: Date.now(),
            name,
            price,
            quantity,
            composition,
            photo: reader.result
        };

        products.push(product);
        saveData();
        renderProducts();
    };

    if (photoInput.files[0]) {
        reader.readAsDataURL(photoInput.files[0]);
    }
}

function renderProducts(filter = "") {
    const table = document.getElementById("productTable");
    table.innerHTML = "";

    const sortField = document.getElementById("sortField")?.value || "name";
    const sortDirection = document.getElementById("sortDirection")?.value || "asc";

    let filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(filter.toLowerCase())
    );

    // 🔽 СОРТИРОВКА
    filteredProducts.sort((a, b) => {
        let valueA = a[sortField];
        let valueB = b[sortField];

        if (sortField === "name") {
            valueA = valueA.toLowerCase();
            valueB = valueB.toLowerCase();
        }

        if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
        if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
        return 0;
    });

    filteredProducts.forEach(product => {
        table.innerHTML += `
            <tr>
                <td><img src="${product.photo}" class="product-img"></td>
                <td>${product.name}</td>
                <td>${product.price}</td>
                <td>${product.quantity}</td>
                <td><button onclick="alert('${product.composition}')">Состав</button></td>
                <td>
                    <button onclick="sellProduct(${product.id})">Продать</button>
                    <button onclick="deleteProduct(${product.id})">Удалить</button>
                </td>
            </tr>
        `;
    });
}

function sellProduct(id) {
    const product = products.find(p => p.id === id);
    if (product.quantity > 0) {
        product.quantity--;
        sales.push({
            name: product.name,
            price: product.price,
            date: new Date().toISOString()
        });
        saveData();
        renderProducts();
        renderReport();
    } else {
        alert("Нет товара на складе!");
    }
}

function deleteProduct(id) {
    products = products.filter(p => p.id !== id);
    saveData();
    renderProducts();
}

function renderReport() {
    const table = document.getElementById("reportTable");
    table.innerHTML = "";

    const grouped = {};

    sales.forEach(s => {
        if (!grouped[s.name]) {
            grouped[s.name] = { sold: 0, revenue: 0, lastDate: s.date };
        }
        grouped[s.name].sold++;
        grouped[s.name].revenue += s.price;
        grouped[s.name].lastDate = s.date;
    });

    for (let name in grouped) {
        table.innerHTML += `
            <tr>
                <td>${name}</td>
                <td>${grouped[name].sold}</td>
                <td>${grouped[name].revenue.toFixed(2)}</td>
                <td>${new Date(grouped[name].lastDate).toLocaleDateString()}</td>
            </tr>
        `;
    }
}

document.getElementById("sortField").addEventListener("change", () => {
    renderProducts(document.getElementById("search").value);
});

document.getElementById("sortDirection").addEventListener("change", () => {
    renderProducts(document.getElementById("search").value);
});

renderProducts();
renderReport();

