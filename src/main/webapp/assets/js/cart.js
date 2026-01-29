/*********************************
 * GLOBAL STATE
 *********************************/
let GLOBAL_TOTAL_QTY = 0;
let GLOBAL_SUBTOTAL = 0;
let GLOBAL_SHIPPING_PRICE = 0;

/*********************************
 * PAGE LOAD
 *********************************/
window.addEventListener("load", async () => {
    Notiflix.Loading.pulse("Wait...", {
        clickToClose: false,
        svgColor: '#0284c7'
    });

    try {
        await loadCartItems();
        await renderShippingPanel();
    } finally {
        Notiflix.Loading.remove();
    }
});


function renderShippingPanel() {
    const tbody = document.getElementById("shipping-row");
    tbody.innerHTML = "";



        const minQty = 20;
        const isDisabled = GLOBAL_TOTAL_QTY <= minQty;


        // Keep your original design exactly
        tbody.innerHTML += `
            <tr class="summary-shipping-row ${isDisabled ? '' : 'text-muted'}">
                <td style="margin-top: 10px">
                    <div class="custom-control custom-radio">
                        <input 
                            type="radio"
                            id="1"
                            name="shipping"
                            class="custom-control-input"
                            value="1"
                            data-price="500"
                            ${isDisabled ? "checked" : "disabled"}>
                        <label class="custom-control-label" for="1">
                            Standard
                            
                            ${isDisabled ? "" : `<span class="text-danger"> (Free Shipping Available)</span>`}
                        </label>
                    </div>
                </td>
                <td>Rs. 500.00</td>
            </tr>
            
            <tr class="summary-shipping-row ${isDisabled ? 'text-muted' : ''}">
                <td style="margin-top: 10px">
                    <div class="custom-control custom-radio">
                        <input 
                            type="radio"
                            id="2"
                            name="shipping"
                            class="custom-control-input"
                            value="2"
                            data-price="0"
                            ${isDisabled ? "disabled" : "checked"}>
                        <label class="custom-control-label" for="2">
                            Free Shipping
                            ${minQty > 1 ? `(Min qty: ${minQty})` : ""}
                            ${isDisabled ? `<span class="text-danger"> (Unavailable)</span>` : ""}
                        </label>
                    </div>
                </td>
                <td>Rs. 0.00</td>
            </tr>
        `;

    const selected = document.querySelector("input[name='shipping']:checked");
    GLOBAL_SHIPPING_PRICE = selected ? parseFloat(selected.dataset.price) : 0;

    calculateFinalTotal();
}



/*********************************
 * CART
 *********************************/
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

    if (!cartItemContainer || !cartEmptyContainer || !cartContentContainer) {
        console.error("Required cart elements not found!");
        return;
    }

    cartItemContainer.innerHTML = "";
    let subtotal = 0;
    let totalQty = 0;

    if (!cartItems || cartItems.length === 0) {
        cartEmptyContainer.style.display = 'block';
        cartContentContainer.style.display = 'none';
        updateCartSummary(0, 0);
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

        // Keep your design exactly
        cartItemContainer.innerHTML += `<tr id="cart-row-${numericCartId}">
											<td class="product-col">
												<div class="product">
													<figure class="product-media">
														<a href="#">
															<img src="${cart.image}" alt="Product image">
														</a>
													</figure>
													<h4 class="product-title">
														<a href="product.html?id=${cart.productId}" style="font-size: medium" target="_blank">${cart.title}</a>
													</h4>
												</div>
											</td>
                                            <td class="size-col">
                                                <div class="product-nav product-nav-dots " id="product-color">
                                                    <a href="#"
                                                       class="product-color-swatch active}"
                                                       data-hex="${cart.color}"
                                                        style="background:${cart.color}; border: 3px solid #1cc0a0;"
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

    updateCartSummary(subtotal, totalQty);
}


document.addEventListener("click", async function (e) {
    if (e.target.classList.contains("plus") || e.target.closest(".plus")) {
        const button = e.target.classList.contains("plus") ? e.target : e.target.closest(".plus");
        await updateCartItemQuantity(button.dataset.cartId, 1);
    }

    if (e.target.classList.contains("minus") || e.target.closest(".minus")) {
        const button = e.target.classList.contains("minus") ? e.target : e.target.closest(".minus");
        await updateCartItemQuantity(button.dataset.cartId, -1);
    }

    if (e.target.classList.contains("btn-remove") || e.target.closest(".btn-remove")) {
        const button = e.target.classList.contains("btn-remove") ? e.target : e.target.closest(".btn-remove");

        Notiflix.Confirm.show(
            'Remove Item',
            'Are you sure you want to remove this item from cart?',
            'Remove',
            'Cancel',
            async function() {
                await removeCartItem(button.dataset.cartId);
            },
            function() {
                // User clicked "Cancel"
                Notiflix.Notify.info('Item removal cancelled', {
                    position: 'center-top',
                    timeout: 1500
                });
            }
        );    }
});

async function updateCartItemQuantity(cartId, qtyChange) {
    await fetch(`api/carts/update-quantity/${cartId}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ qty: qtyChange })
    });
    await loadCartItems();
    await renderShippingPanel();
}

async function removeCartItem(cartId) {
    await fetch(`api/carts/remove/${cartId}`, {method: "DELETE"});
    await loadCartItems();
    await renderShippingPanel();
}



function updateCartSummary() {
    const subtotalEl = document.getElementById("cart-subtotal");
    if (subtotalEl) subtotalEl.textContent = `Rs. ${GLOBAL_SUBTOTAL.toFixed(2)}`;
    calculateFinalTotal();
}

function calculateFinalTotal() {
    const totalEl = document.getElementById("cart-total");
    if (totalEl) totalEl.textContent = `Rs. ${(GLOBAL_SUBTOTAL + GLOBAL_SHIPPING_PRICE).toFixed(2)}`;
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