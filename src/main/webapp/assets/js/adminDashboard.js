window.addEventListener("load", async () => {
    await Promise.all([
        loadOrderStats(),
        loadCustomerStats(),
        loadProductStats()
    ]);
});

async function loadOrderStats() {
    const ordersEl = document.getElementById("stat-total-orders");
    const revenueEl = document.getElementById("stat-total-revenue");
    if (!ordersEl && !revenueEl) return;

    try {
        const response = await fetch("api/admin/orders/statistics");
        if (response.ok) {
            const data = await response.json();
            if (data.status) {
                if (ordersEl) ordersEl.textContent = formatNumber(data.data.total);
                if (revenueEl) revenueEl.textContent = "Rs." + formatNumber(data.data.totalRevenue);
            } else {
                if (ordersEl) ordersEl.textContent = "0";
                if (revenueEl) revenueEl.textContent = "Rs.0";
            }
        }
    } catch (error) {
        console.error("Error loading order statistics:", error);
    }
}

async function loadCustomerStats() {
    const customersEl = document.getElementById("stat-total-customers");
    if (!customersEl) return;

    try {
        const response = await fetch("api/user/all");
        if (response.ok) {
            const data = await response.json();
            if (data.status) {
                customersEl.textContent = formatNumber(data.users.length);
            } else {
                customersEl.textContent = "0";
            }
        }
    } catch (error) {
        console.error("Error loading customer statistics:", error);
    }
}

async function loadProductStats() {
    const productsEl = document.getElementById("stat-total-products");
    const productsSubEl = document.getElementById("stat-products-sub");
    if (!productsEl) return;

    try {
        const response = await fetch("api/product/statistics");
        if (response.ok) {
            const data = await response.json();
            if (data.status) {
                productsEl.textContent = formatNumber(data.data.totalProducts);
                if (productsSubEl && data.data.lowStockVariants > 0) {
                    productsSubEl.innerHTML = `<span class="col-orange">${data.data.lowStockVariants}</span> low stock`;
                }
            } else {
                productsEl.textContent = "0";
            }
        }
    } catch (error) {
        console.error("Error loading product statistics:", error);
    }
}

function formatNumber(value) {
    const num = Number(value) || 0;
    return num.toLocaleString();
}