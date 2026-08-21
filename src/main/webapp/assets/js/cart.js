

let GLOBAL_TOTAL_QTY = 0;
let GLOBAL_SUBTOTAL = 0;
let GLOBAL_SHIPPING_PRICE = 0;



window.addEventListener("load", async () => {
    Notiflix.Loading.pulse("Wait...", { clickToClose: false, svgColor: '#0284c7' });

    try {
        await loadCartItems();
    } finally {
        Notiflix.Loading.remove();
    }
});


async function loadCartItems() {
    try {
        const response = await fetch("api/carts/all-carts");
        if (!response.ok) throw new Error("Cart load failed");

        const data = await response.json();
        renderingCartPanel(data.cartItems || []);
    } catch (e) {
        console.error(e);
        renderingCartPanel([]);
    }
}

function renderingCartPanel(cartItems) {
    const cartItemContainer = document.getElementById("cart-item-container");
    const cartEmptyContainer = document.getElementById("cart-empty-container");
    const cartContentContainer = document.getElementById("cart-content-container");
    if (!cartItemContainer || !cartEmptyContainer || !cartContentContainer) return;

    cartItemContainer.innerHTML = "";
    let subtotal = 0;
    let totalQty = 0;

    if (!cartItems.length) {
        cartEmptyContainer.style.display = 'block';
        cartContentContainer.style.display = 'none';
        GLOBAL_SUBTOTAL = 0;
        GLOBAL_TOTAL_QTY = 0;
        renderShippingPanel();
        updateCartSummary();
        return;
    }

    cartEmptyContainer.style.display = 'none';
    cartContentContainer.style.display = 'block';

    cartItems.forEach(cart => {
        const price = parseFloat(cart.price) || 0;
        const qty = parseInt(cart.qty) || 1;
        const itemTotal = price * qty;
        subtotal += itemTotal;
        totalQty += qty;

        const cartId = cart.cartId || cart.id;
        const numericCartId = parseInt(cartId) || cartId;

        cartItemContainer.innerHTML += `<tr id="cart-row-${numericCartId}">
            <td class="product-col">
                <div class="product">
                    <figure class="product-media">
                        <a href="#"> <img src="${cart.image}" alt="Product image"></a> 
                    </figure>
                        <h4 class="product-title">
                            <a href="product.html?id=${cart.productId}" style="font-size: medium" target="_blank">${cart.title}</a>
                        </h4>
                        </div>
                           </td> 
                           <td class="size-col">
                                <div class="product-nav product-nav-dots " id="product-color">
                                     <a href="#" class="product-color-swatch active}" data-hex="${cart.color}" style="background:${cart.color}; border: 3px solid #1cc0a0;" 
                                        <span class="sr-only"></span>
                                     </a>
                                </div>
                           </td>
                            
                           <td class="size-col">${cart.size}</td>
                            
                           <td class="price-col">Rs. ${cart.price.toFixed(2)}</td>
                           
                           <td class="quantity-col">
                             <div class="qty-wrapper">
                                 <button class="qty-btn minus" data-cart-id="${numericCartId}">−</button>
                                 <input type="number" class="qty-input" value="${qty}" min="1" data-cart-id="${numericCartId}">
                                 <button class="qty-btn plus" data-cart-id="${numericCartId}">+</button>
                             </div>
                           </td>
                             
                           <td class="total-col">Rs.${itemTotal}.00</td>
                            
                           <td class="remove-col">
                             <button class="btn-remove" data-cart-id="${numericCartId}">
                               <i class="icon-close"></i>
                             </button> 
                           </td>
                        </tr>`;

    });

    GLOBAL_TOTAL_QTY = totalQty;
    GLOBAL_SUBTOTAL = subtotal;

    renderShippingPanel();
    updateCartSummary();
}


async function renderShippingPanel() {
    const tbody = document.getElementById("shipping-row");
    tbody.innerHTML = "";

    if (GLOBAL_TOTAL_QTY >= 20) {
        sessionStorage.removeItem("selectedShipping");
    }


    try {
        const response = await fetch("api/carts/shipping");
        if (!response.ok) throw new Error("Failed to fetch shipping options");

        const result = await response.json();
        const shippingOptions = result.data || [];

        const isFreeShippingAvailable = GLOBAL_TOTAL_QTY >= 20;

        let paidChecked = false;

        shippingOptions.forEach(option => {
            let checked = "";
            let disabled = "";

            if (option.type.toLowerCase() === "free shipping") {
                if (isFreeShippingAvailable) {
                    checked = "checked";
                } else {
                    disabled = "disabled";
                }
            } else {

                if (isFreeShippingAvailable) {
                    disabled = "disabled";
                } else if (!paidChecked) {
                    checked = "checked";
                    paidChecked = true;
                }
            }

            tbody.innerHTML += `
    <tr class="summary-shipping-row ${disabled ? 'text-muted' : ''}">
        <td>
            <div class="custom-control custom-radio">
                <input type="radio"
                       id="shipping-${option.id}"
                       name="shipping"
                       class="custom-control-input"
                       value="${option.id}"
                       data-price="${option.price}"
                       ${checked} ${disabled}>
                <label class="custom-control-label" for="shipping-${option.id}">
                    ${option.type}
                    ${!isFreeShippingAvailable && option.type.toLowerCase() === "free shipping"
                ? `<span>(Min qty: 20)</span><span class="text-danger"> (Unavailable)</span>`
                : ''}
                </label>
            </div>
        </td>
        <td>Rs. ${option.price.toFixed(2)}</td>
    </tr>`;
        });


        document.querySelectorAll("input[name='shipping']").forEach(radio => {
            radio.addEventListener("change", function () {

                const shippingData = {
                    id: this.value,
                    price: parseFloat(this.dataset.price) || 0,
                    label: this.closest("tr").querySelector("label").innerText.trim()
                };

                GLOBAL_SHIPPING_PRICE = shippingData.price;

                sessionStorage.setItem("selectedShipping", JSON.stringify(shippingData));

                calculateFinalTotal();
            });
        });


        const selected = document.querySelector("input[name='shipping']:checked");
        if (selected) {
            const shippingData = {
                id: selected.value,
                price: parseFloat(selected.dataset.price) || 0,
                label: selected.closest("tr").querySelector("label").innerText.trim()
            };

            GLOBAL_SHIPPING_PRICE = shippingData.price;

            sessionStorage.setItem("selectedShipping", JSON.stringify(shippingData));
        }

        calculateFinalTotal();




    } catch (err) {
        console.error("Error loading shipping options:", err);
        tbody.innerHTML = `<tr><td colspan="2">Failed to load shipping options</td></tr>`;
        GLOBAL_SHIPPING_PRICE = 0;
        calculateFinalTotal();
    }
}



document.addEventListener("click", async function (e) {
    const btn = e.target.closest("button");
    if (!btn) return;

    const cartId = btn.dataset.cartId;
    if (!cartId) return;

    if (btn.classList.contains("plus")) {
        await updateCartItemQuantity(cartId, 1);
    } else if (btn.classList.contains("minus")) {
        await updateCartItemQuantity(cartId, -1);
    } else if (btn.classList.contains("btn-remove")) {
        Notiflix.Confirm.show(
            'Remove Item',
            'Are you sure you want to remove this item?',
            'Remove', 'Cancel',
            async () => await removeCartItem(cartId),
            () => Notiflix.Notify.info('Item removal cancelled', { position: 'center-top', timeout: 1500 })
        );
    }
});

async function updateCartItemQuantity(cartId, qtyChange) {
    await fetch(`api/carts/update-quantity/${cartId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qty: qtyChange })
    });
    await loadCartItems();
}

async function removeCartItem(cartId) {
    await fetch(`api/carts/remove/${cartId}`, { method: "DELETE" });
    await loadCartItems();
}


function updateCartSummary() {
    const subtotalEl = document.getElementById("cart-subtotal");
    if (subtotalEl) subtotalEl.textContent = `Rs. ${GLOBAL_SUBTOTAL.toFixed(2)}`;

    calculateFinalTotal();
}

function calculateFinalTotal() {
    const total = (parseFloat(GLOBAL_SUBTOTAL) || 0) + (parseFloat(GLOBAL_SHIPPING_PRICE) || 0);
    const totalEl = document.getElementById("cart-total");
    if (totalEl) totalEl.textContent = `Rs. ${total.toFixed(2)}`;
}



async function addToCart(productId, color, size, qty) {
    console.log("Adding to cart:", {productId, color, size, qty});

    try {
        Notiflix.Loading.pulse("Wait...", {
            clickToClose: false,
            svgColor: '#0284c7'
        });

        const obj = {
            productId: productId,
            colorName: color,
            size: size,
            qty: qty
        }

        if (!obj.colorName || !obj.size || obj.qty < 1) {
            Notiflix.Notify.failure("Please select color, size and quantity");
            Notiflix.Loading.remove();
            return;
        }

        const response = await fetch(`api/carts/add-to-cart`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(obj)
        });

        if (response.ok) {
            const data = await response.json();
            if (data.status) {
                await updateCartCount();
                Notiflix.Notify.success(data.message, {
                    position: 'center-top'
                });
            } else {
                Notiflix.Notify.failure(data.message || "Add to cart process failed!", {
                    position: 'center-top'
                });
            }
        } else {
            Notiflix.Notify.failure("Server error occurred!", {
                position: 'center-top'
            });
        }

    } catch (e) {
        console.error("Error adding to cart:", e);
        Notiflix.Notify.failure(e.message, {
            position: 'center-top'
        });
    } finally {
        Notiflix.Loading.remove();
    }
}