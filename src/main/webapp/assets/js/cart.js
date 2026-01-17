async function addToCart(productId, color, size, qty) {
    // qty is now a number, not an element
    console.log("Adding to cart:", { productId, color, size, qty });

    try {
        Notiflix.Loading.pulse("Wait...", {
            clickToClose: false,
            svgColor: '#0284c7'
        });

        const obj = {
            productId: productId,
            colorName: color,
            size: size,
            qty: qty  // This is now a number
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

        if(response.ok){
            const data = await response.json();
            if(data.status){
                await updateCartCount();

                Notiflix.Notify.success(data.message, {
                    position: 'center-top'
                });
                // If loadCartItems is defined, call it
                if (typeof loadCartItems === 'function') {
                    await loadCartItems();
                }
            }else{
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