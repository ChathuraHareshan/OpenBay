



window.addEventListener("load", async () => {
    Notiflix.Loading.pulse("Wait...", { clickToClose: false, svgColor: '#0284c7' });

    try {
        await loadWatchlistItems();
    } finally {
        Notiflix.Loading.remove();
    }
});


async function loadWatchlistItems() {
    try {
        const response = await fetch("api/watchlists/all-watchlists");
        if (!response.ok) throw new Error("watchlist load failed");

        const data = await response.json();
        renderingwatchlistPanel(data.watchlistItems || []);
    } catch (e) {
        console.error(e);
        renderingwatchlistPanel([]);
    }
}

function renderingwatchlistPanel(watchlistItems) {
    const watchlistItemContainer = document.getElementById("watchlist-item-container");
    const watchlistEmptyContainer = document.getElementById("watchlist-empty-container");
    const watchlistContentContainer = document.getElementById("watchlist-content-container");
    if (!watchlistItemContainer || !watchlistEmptyContainer || !watchlistContentContainer) return;

    watchlistItemContainer.innerHTML = "";
    let subtotal = 0;
    let totalQty = 0;

    if (!watchlistItems.length) {
        watchlistEmptyContainer.style.display = 'block';
        watchlistContentContainer.style.display = 'none';
        GLOBAL_SUBTOTAL = 0;
        GLOBAL_TOTAL_QTY = 0;
        renderShippingPanel(); // Update shipping for empty watchlist
        updatewatchlistSummary();
        return;
    }

    watchlistEmptyContainer.style.display = 'none';
    watchlistContentContainer.style.display = 'block';

    watchlistItems.forEach(watchlist => {
        const price = parseFloat(watchlist.price) || 0;
        const qty = parseInt(watchlist.qty) || 1;
        const itemTotal = price * qty;
        subtotal += itemTotal;
        totalQty += qty;

        const watchlistId = watchlist.watchlistId || watchlist.id;
        const numericwatchlistId = parseInt(watchlistId) || watchlistId;

        watchlistItemContainer.innerHTML += `<tr id="watchlist-row-${numericwatchlistId}">
            <td class="product-col">
                <div class="product">
                    <figure class="product-media">
                        <a href="#"> <img src="${watchlist.image}" alt="Product image"></a> 
                    </figure>
                        <h4 class="product-title">
                            <a href="product.html?id=${watchlist.productId}" style="font-size: medium" target="_blank">${watchlist.title}</a>
                        </h4>
                        </div>
                           </td> 
                           <td class="size-col">
                                <div class="product-nav product-nav-dots " id="product-color">
                                     <a href="#" class="product-color-swatch active}" data-hex="${watchlist.color}" style="background:${watchlist.color}; border: 3px solid #1cc0a0;" 
                                        <span class="sr-only"></span>
                                     </a>
                                </div>
                           </td>
                            
                           <td class="size-col">${watchlist.size}</td>
                            
                           <td class="price-col">Rs. ${watchlist.price.toFixed(2)}</td>
                           
                           <td class="quantity-col">
                             <div class="qty-wrapper">
                                 <button class="qty-btn minus" data-watchlist-id="${numericwatchlistId}">−</button>
                                 <input type="number" class="qty-input" value="${qty}" min="1" data-watchlist-id="${numericwatchlistId}">
                                 <button class="qty-btn plus" data-watchlist-id="${numericwatchlistId}">+</button>
                             </div>
                           </td>
                             
                           <td class="total-col">Rs.${itemTotal}.00</td>
                            
                           <td class="remove-col">
                             <button class="btn-remove" data-watchlist-id="${numericwatchlistId}">
                               <i class="icon-close"></i>
                             </button> 
                           </td>
                        </tr>`;

    });

    GLOBAL_TOTAL_QTY = totalQty;
    GLOBAL_SUBTOTAL = subtotal;

    renderShippingPanel(); // Render shipping options based on total qty
    updatewatchlistSummary();
}




document.addEventListener("click", async function (e) {
    const btn = e.target.closest("button");
    if (!btn) return;

    const watchlistId = btn.dataset.watchlistId;
    if (!watchlistId) return;

    if (btn.classList.contains("plus")) {
        await updatewatchlistItemQuantity(watchlistId, 1);
    } else if (btn.classList.contains("minus")) {
        await updatewatchlistItemQuantity(watchlistId, -1);
    } else if (btn.classList.contains("btn-remove")) {
        Notiflix.Confirm.show(
            'Remove Item',
            'Are you sure you want to remove this item?',
            'Remove', 'Cancel',
            async () => await removewatchlistItem(watchlistId),
            () => Notiflix.Notify.info('Item removal cancelled', { position: 'center-top', timeout: 1500 })
        );
    }
});


async function removewatchlistItem(watchlistId) {
    await fetch(`api/watchlists/remove/${watchlistId}`, { method: "DELETE" });
    await loadwatchlistItems();
}



async function addTowatchlist(productId) {
    console.log("Adding to watchlist:", {productId});

    try {
        Notiflix.Loading.pulse("Wait...", {
            clickToClose: false,
            svgColor: '#0284c7'
        });

        const obj = {
            productId: productId
        }


        const response = await fetch(`api/watchlist/add-to-watchlist`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(obj)
        });

        if (response.ok) {
            const data = await response.json();
            if (data.status) {
                await updatewatchlistCount();
                Notiflix.Notify.success(data.message, {
                    position: 'center-top'
                });
            } else {
                Notiflix.Notify.failure(data.message || "Add to watchlist process failed!", {
                    position: 'center-top'
                });
            }
        } else {
            Notiflix.Notify.failure("Server error occurred!", {
                position: 'center-top'
            });
        }

    } catch (e) {
        console.error("Error adding to watchlist:", e);
        Notiflix.Notify.failure(e.message, {
            position: 'center-top'
        });
    } finally {
        Notiflix.Loading.remove();
    }
}