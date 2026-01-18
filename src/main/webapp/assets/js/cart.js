window.addEventListener("load", async () => {
    Notiflix.Loading.pulse("Wait...", {
        clickToClose: false,
        svgColor: '#0284c7'
    });

    try {
        await loadCartItems();
    } finally {
        Notiflix.Loading.remove();
    }
});

async function loadCartItems() {
    try {
        Notiflix.Loading.pulse("Loading cart...", {
            clickToClose: false,
            svgColor: '#0284c7'
        });

        const response = await fetch("api/carts/all-carts");
        if (response.ok) {
            const data = await response.json();
            if (data.status) {
                console.log("Cart data:", data);
                renderingCartPanel(data.cartItems || data.carts || []);
            } else {
                Notiflix.Notify.info(data.message || "Cart is empty", {
                    position: 'center-top'
                });
                renderingCartPanel([]);
            }
        } else {
            Notiflix.Notify.failure("Failed to load cart items", {
                position: 'center-top'
            });
            renderingCartPanel([]);
        }
    } catch (e) {
        console.error("Error loading cart:", e);
        Notiflix.Notify.failure("Network error occurred", {
            position: 'center-top'
        });
        renderingCartPanel([]);
    } finally {
        Notiflix.Loading.remove();
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

    // Clear the container
    cartItemContainer.innerHTML = "";

    if (!cartItems || cartItems.length === 0) {
        // Show empty cart message
        cartEmptyContainer.style.display = 'block';
        cartContentContainer.style.display = 'none';
        updateCartSummary(0, 0);
        return;
    }

    // Show cart content
    cartEmptyContainer.style.display = 'none';
    cartContentContainer.style.display = 'block';

    let subtotal = 0;
    let totalQty = 0;

    cartItems.forEach((cart, index) => {
        // Make sure cart properties exist with fallback values
        const price = parseFloat(cart.price) || 0;
        const qty = parseInt(cart.qty) || 1;
        const itemTotal = price * qty;
        subtotal += itemTotal;
        totalQty += qty;

        // Use the cartId from backend - this should be a number (1, 2, 3...)
        const cartId = cart.cartId || cart.id;
        console.log(`Rendering cart item - ID: ${cartId}, Type: ${typeof cartId}`);

        // Create a new row element
        const row = document.createElement("tr");
        row.id = `cart-row-${cartId}`;
        row.setAttribute("data-cart-id", cartId);

        // Check if it's a number, if not convert it
        const numericCartId = parseInt(cartId) || cartId;


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
                    <input type="number" class="qty-input" value="${qty}" min="1" 
                           data-cart-id="${numericCartId}">
                    <button class="qty-btn plus" data-cart-id="${numericCartId}">+</button>
                                
                                                </div>
                                            </td>
                                            
											<td class="total-col">Rs.${cart.price * cart.qty}.00</td>
 <td class="remove-col">
                <button class="btn-remove" data-cart-id="${numericCartId}">
                    <i class="icon-close"></i>
                </button>
            </td>										</tr>`;



    });


    updateCartSummary(subtotal, totalQty);
}

document.addEventListener("click", async function (e) {
    // Handle plus button click
    if (e.target.classList.contains("plus") || e.target.closest(".plus")) {
        const button = e.target.classList.contains("plus") ? e.target : e.target.closest(".plus");
        const cartId = button.dataset.cartId;

        console.log("Plus clicked, cartId:", cartId, "Type:", typeof cartId);

        if (cartId) {
            const row = button.closest("tr");
            const input = row.querySelector(".qty-input");
            let currentQty = parseInt(input.value) || 1;

            input.value = currentQty + 1;

            await updateCartItemQuantity(cartId, 1);
        }
    }

    // Handle minus button click
    if (e.target.classList.contains("minus") || e.target.closest(".minus")) {
        const button = e.target.classList.contains("minus") ? e.target : e.target.closest(".minus");
        const cartId = button.dataset.cartId;

        console.log("Minus clicked, cartId:", cartId, "Type:", typeof cartId);

        if (cartId) {
            const row = button.closest("tr");
            const input = row.querySelector(".qty-input");
            let currentQty = parseInt(input.value) || 1;

            if (currentQty > 1) {
                input.value = currentQty - 1;

                await updateCartItemQuantity(cartId, -1);
            }
        }
    }

    if (e.target.classList.contains("btn-remove") || e.target.closest(".btn-remove")) {
        const button = e.target.classList.contains("btn-remove") ? e.target : e.target.closest(".btn-remove");
        const cartId = button.dataset.cartId;

        console.log("Remove clicked, cartId:", cartId);



        Notiflix.Confirm.show(
            'Remove Item',
            'Are you sure you want to remove this item from cart?',
            'Remove',
            'Cancel',
            async function() {
                // User clicked "Remove"
                await removeCartItem(cartId);
            },
            function() {
                // User clicked "Cancel"
                Notiflix.Notify.info('Item removal cancelled', {
                    position: 'center-top',
                    timeout: 1500
                });
            }
        );
    }
});


async function removeCartItem(cartId) {
    try {
        let numericCartId = cartId;

        if (typeof cartId === 'string') {
            numericCartId = parseInt(cartId.replace(/[^0-9]/g, ''));
        }

        if (isNaN(numericCartId) || numericCartId <= 0) {
            Notiflix.Notify.failure("Invalid cart item");
            return;
        }

        Notiflix.Loading.pulse("Removing item...", {
            clickToClose: false,
            svgColor: '#0284c7'
        });

        const response = await fetch(`api/carts/remove/${numericCartId}`, {
            method: "DELETE"
        });

        const data = await response.json();
        if (data.status) {
            Notiflix.Notify.success(data.message);
            await loadCartItems();
        } else {
            Notiflix.Notify.failure(data.message);
        }

    } catch (e) {
        console.error("Error removing cart item:", e);
        Notiflix.Notify.failure("Network error: " + e.message);
    } finally {
        Notiflix.Loading.remove();
    }
}

async function updateCartItemQuantity(cartId, qtyChange) {
    try {
        // Ensure cartId is a number
        let numericCartId = cartId;

        // If it's a string, try to convert to number
        if (typeof cartId === 'string') {
            // Remove any non-numeric characters
            numericCartId = parseInt(cartId.replace(/[^0-9]/g, ''));
        }

        // Check if we got a valid number
        if (isNaN(numericCartId) || numericCartId <= 0) {
            console.error("Invalid cart ID:", cartId, "Parsed as:", numericCartId);
            Notiflix.Notify.failure("Invalid cart item");
            return;
        }

        console.log("Updating cart ID:", numericCartId, "Change:", qtyChange);

        Notiflix.Loading.pulse("Updating quantity...", {
            clickToClose: false,
            svgColor: '#0284c7'
        });

        const response = await fetch(`api/carts/update-quantity/${numericCartId}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ qty: qtyChange })
        });

        const data = await response.json();
        if (data.status) {
            Notiflix.Notify.success(data.message);
            // Refresh the entire cart to get updated prices and totals
            await loadCartItems();
        } else {
            Notiflix.Notify.failure(data.message);
            // If update failed, reload cart to reset quantities
            await loadCartItems();
        }

    } catch (e) {
        console.error("Error updating cart quantity:", e);
        Notiflix.Notify.failure("Network error: " + e.message);
        // Reload cart on error too
        await loadCartItems();
    } finally {
        Notiflix.Loading.remove();
    }
}


async function removeFromSessionCart(productId, color, size) {
    try {
        Notiflix.Loading.pulse("ඉවත් කෙරේ...", {
            clickToClose: false,
            svgColor: '#0284c7'
        });

        const response = await fetch(`/api/carts/remove-session-item`, {
            method: "DELETE",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                productId: productId,
                color: color,
                size: size
            })
        });

        if (response.ok) {
            const data = await response.json();
            if (data.status) {
                Notiflix.Notify.success(data.message);
                await loadCartItems();
            } else {
                Notiflix.Notify.failure(data.message);
            }
        }
    } catch (error) {
        console.error("Error:", error);
        Notiflix.Notify.failure("Network error occurred");
    } finally {
        Notiflix.Loading.remove();
    }
}



function updateCartSummary(subtotal, totalQty) {
    // Update subtotal
    const subtotalElement = document.getElementById("cart-subtotal");
    if (subtotalElement) {
        subtotalElement.textContent = `Rs. ${subtotal.toFixed(2)}`;
    }

    // Update total
    const totalElement = document.getElementById("cart-total");
    if (totalElement) {
        totalElement.textContent = `Rs. ${subtotal.toFixed(2)}`;
    }

    // Update total items in cart count (header)
    updateCartCount();
}

window.loadCartItems = loadCartItems;


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