const params = new URLSearchParams(window.location.search);
const productId = params.get("id");
let selectedColor = null;
let selectedSize = null;
let currentProduct = null;
let currentSizes = [];

window.addEventListener("load", async () => {
    try {
        Notiflix.Loading.pulse("Wait...", {
            clickToClose: false,
            svgColor: '#0284c7'
        });
        await loadSingleProduct();
    } finally {
        Notiflix.Loading.remove();
    }
});

async function loadSingleProduct() {
    try {

        const response = await fetch(`api/single-products/product?Id=${productId}`);

        if (response.ok) {

            const data = await response.json();

            if (data.status) {

                console.log(data);
                const product = data.singleProduct;
                currentProduct = product;

                const mainImage = document.getElementById("product-main-image");

                mainImage.src = product.images[0];
                mainImage.setAttribute("data-zoom-image", product.images[0]);
                mainImage.alt = product.title;
                mainImage.style.height = 'auto';

                const mobileContainer = document.getElementById("product-thumbs-horizontal-container");

                mobileContainer.innerHTML = "";

                product.images.forEach((image, index) => {
                    const thumbDiv = document.createElement("div");
                    thumbDiv.className = `product-thumb-horizontal ${index === 0 ? "active" : ""}`;
                    const img = document.createElement("img");
                    img.src = image.replace('.jpg', '-small.jpg');
                    img.alt = `${product.title} - view ${index + 1}`;
                    img.setAttribute("data-image", image);
                    img.setAttribute("data-zoom-image", image);
                    thumbDiv.appendChild(img);
                    thumbDiv.addEventListener("click", (e) => {
                        e.preventDefault();
                        document.querySelectorAll(".product-thumb-horizontal").forEach(el => {
                            el.classList.remove("active");
                        });
                        thumbDiv.classList.add("active");
                        mainImage.src = image;
                        mainImage.setAttribute("data-zoom-image", image);
                    });
                    mobileContainer.appendChild(thumbDiv);
                });

                const desktopContainer = document.querySelector(".product-thumbs-vertical-container");

                if (desktopContainer) {
                    desktopContainer.innerHTML = "";
                    product.images.forEach((image, index) => {
                        const thumbDiv = document.createElement("div");
                        thumbDiv.className = `product-thumb-vertical ${index === 0 ? "active" : ""}`;
                        const img = document.createElement("img");
                        img.src = image.replace('.jpg', '-small.jpg');
                        img.alt = `${product.title} - view ${index + 1}`;
                        img.setAttribute("data-image", image);
                        img.setAttribute("data-zoom-image", image);
                        thumbDiv.appendChild(img);
                        thumbDiv.addEventListener("click", (e) => {
                            e.preventDefault();
                            document.querySelectorAll(".product-thumb-vertical").forEach(el => {
                                el.classList.remove("active");
                            });
                            document.querySelectorAll(".product-thumb-horizontal").forEach(el => {
                                el.classList.remove("active");
                            });
                            thumbDiv.classList.add("active");
                            if (index < mobileContainer.children.length) {
                                mobileContainer.children[index].classList.add("active");
                            }
                            mainImage.src = image;
                            mainImage.setAttribute("data-zoom-image", image);
                        });
                        desktopContainer.appendChild(thumbDiv);
                    });
                    initializeVerticalScroll();
                }

                const priceHtml = product.minPrice ?
                    `Rs.${product.minPrice}.00` :
                    `Select color for price`;

                document.getElementById("product-price").innerHTML = priceHtml;

                const uniqueColors = [...new Map(product.colors.map(item => [item.hexCode, item])).values()];
                let colorHtml = '';
                uniqueColors.forEach((color, index) => {
                    colorHtml += `
                        <a href="#"
                           class="product-color-swatch ${index === 0 ? 'active' : ''}"
                           data-name="${color.name}"
                           data-hex="${color.hexCode}"
                           style="background:${color.hexCode};">
                            <span class="sr-only">${color.name}</span>
                        </a>`;
                });

                document.getElementById("product-title").innerHTML = product.title;
                document.getElementById("product-color").innerHTML = colorHtml;

                if (uniqueColors.length > 0) {
                    selectedColor = uniqueColors[0].name;
                    loadColorHasSize(productId, selectedColor);
                }

                initColorSelection(productId);
                initializeSizeDropdown();

                document.getElementById("product-description").innerHTML = product.description;
                document.getElementById("category-name").innerHTML = product.category;
                document.getElementById("model-name").innerHTML = product.model;

                const addToCartBtn = document.getElementById("add-to-cart-btn");
                addToCartBtn.addEventListener("click", async (evt) => {
                    evt.preventDefault();
                    const qtyInput = document.getElementById("qty");
                    // Convert the value to a number
                    const quantity = parseInt(qtyInput.value) || 0;

                    // Validate inputs
                    if (!selectedColor) {
                        Notiflix.Notify.warning("Please select a color first!");
                        return;
                    }
                    if (!selectedSize) {
                        Notiflix.Notify.warning("Please select a size!");
                        return;
                    }
                    if (quantity < 1) {
                        Notiflix.Notify.warning("Please enter a valid quantity!");
                        return;
                    }

                    await addToCart(product.productId, selectedColor, selectedSize, quantity);
                });




                initializeHorizontalScroll();


            } else {
                Notiflix.Notify.failure(data.message, { position: 'center-top' });
            }
        } else {
            Notiflix.Notify.failure("Single Product data loading failed!", { position: 'center-top' });
        }
    } catch (e) {
        console.error("Error loading product:", e);
        Notiflix.Notify.failure("An error occurred while loading the product", { position: 'center-top' });
    }
}

function renderSizeOption(sizes) {
    console.log("renderSizeOption received:", sizes);

    currentSizes = sizes;

    const sizeSelect = document.getElementById("size");

    sizeSelect.innerHTML = '';

    if (Array.isArray(sizes) && sizes.length > 0) {
        if (sizes.length > 1) {
            const defaultOption = document.createElement("option");
            defaultOption.value = "";
            defaultOption.textContent = "Select a size";
            defaultOption.selected = true;
            defaultOption.disabled = false;
            sizeSelect.appendChild(defaultOption);
        }

        sizes.forEach(item => {
            console.log("Processing size item:", item);

            // Validate item structure
            if (item && item.size && item.price !== undefined) {
                const option = document.createElement("option");
                option.value = item.size;
                option.textContent = `${item.size}`;
                option.dataset.price = item.price;
                option.dataset.stock = item.quantity || item.stock || 0;

                // Auto-select if only one size
                if (sizes.length === 1) {
                    option.selected = true;
                }

                sizeSelect.appendChild(option);
            } else {
                console.warn("Invalid size item:", item);
            }
        });

        sizeSelect.disabled = false;

        // Show min/max price range for this color
        showPriceRangeForColor(sizes);

        // If only one size, auto-select it and update UI
        if (sizes.length === 1) {
            const singleSize = sizes[0];
            selectedSize = singleSize.size;

            // Update price for single size
            document.getElementById("product-price").innerHTML = `Rs.${singleSize.price}.00`;
            updateStockDisplay(singleSize.quantity || singleSize.stock || 0);

            // Trigger change event
            const event = new Event('change');
            sizeSelect.dispatchEvent(event);

            Notiflix.Notify.success(`Size: ${singleSize.size} - Rs.${singleSize.price}.00`, {
                position: 'right-top',
                timeout: 2000
            });
        }

        // Remove any existing change event listeners
        const newSizeSelect = sizeSelect.cloneNode(true);
        sizeSelect.parentNode.replaceChild(newSizeSelect, sizeSelect);

        // Get the new reference
        const updatedSizeSelect = document.getElementById("size");

        // Add change event listener
        updatedSizeSelect.addEventListener("change", handleSizeChange);

    } else {
        console.warn("No sizes available or invalid data");
        currentSizes = [];
        const noSizeOption = document.createElement("option");
        noSizeOption.value = "";
        noSizeOption.textContent = "No sizes available";
        noSizeOption.disabled = true;
        noSizeOption.selected = true;
        sizeSelect.appendChild(noSizeOption);
        sizeSelect.disabled = true;

        // Reset price when no sizes
        document.getElementById("product-price").innerHTML = "No sizes available";
        updateStockDisplay(0);
    }
}

function showPriceRangeForColor(sizes) {
    if (!Array.isArray(sizes) || sizes.length === 0) {
        return;
    }

    if (sizes.length === 1) {
        const singleSize = sizes[0];
        document.getElementById("product-price").innerHTML = `Rs.${singleSize.price}.00`;
        return;
    }

    const prices = sizes
        .map(item => parseFloat(item.price) || 0)
        .filter(price => price > 0);

    if (prices.length === 0) {
        return;
    }

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    if (minPrice === maxPrice) {
        document.getElementById("product-price").innerHTML = `Rs.${minPrice}.00`;
    } else {
        document.getElementById("product-price").innerHTML = `Rs.${minPrice}.00 - Rs.${maxPrice}.00`;
    }

    selectedSize = null;
    updateStockDisplay(0);
}

function handleSizeChange() {
    const selectedOption = this.options[this.selectedIndex];
    console.log("Size selected:", selectedOption);

    if (selectedOption.value === "" && currentSizes.length > 1) {
        selectedSize = null;

        if (currentSizes && currentSizes.length > 1) {
            showPriceRangeForColor(currentSizes);
        }
        updateStockDisplay(0);
        return;
    }

    if (selectedOption && selectedOption.value && selectedOption.dataset.price) {
        selectedSize = selectedOption.value;

        document.getElementById("product-price").innerHTML = `Rs.${selectedOption.dataset.price}.00`;

        updateStockDisplay(selectedOption.dataset.stock);

        Notiflix.Notify.success(`Selected size: ${selectedOption.value} - Rs.${selectedOption.dataset.price}.00`, {
            position: 'right-top',
            timeout: 2000
        });
    }
}

async function loadColorHasSize(productId, colorName) {
    Notiflix.Loading.pulse("Wait...", {
        clickToClose: false,
        svgColor: '#0284c7'
    });

    const obj = {
        colorName: colorName,
        productId: productId
    }

    try {
        const response = await fetch(`api/single-products/loadSize`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(obj)
        })

        if (response.ok) {
            const data = await response.json();
            if (data.status) {

                console.log("Raw sizes data:", data.sizes);

                let sizeObjects = [];

                // Check if data.sizes is already an array of objects
                if (Array.isArray(data.sizes) && data.sizes.length > 0 && typeof data.sizes[0] === 'object') {
                    // It's already an array of objects
                    console.log("Already array of objects:", data.sizes);
                    sizeObjects = data.sizes;
                } else {
                    // It's a flat array, convert to objects
                    const flatArray = data.sizes;

                    console.log("Flat array detected, length:", flatArray.length);

                    for (let i = 0; i < flatArray.length; i += 3) {
                        if (i + 2 < flatArray.length) {
                            sizeObjects.push({
                                size: flatArray[i],
                                price: flatArray[i + 1],
                                quantity: flatArray[i + 2]
                            });
                        }
                    }

                    console.log("Parsed sizes:", sizeObjects);
                }

                renderSizeOption(sizeObjects);

                document.getElementById("size").disabled = false;

            } else {
                Notiflix.Notify.failure(data.message, {
                    position: 'center-top'
                });
                document.getElementById("size").disabled = true;

                // Reset price when no sizes available
                document.getElementById("product-price").innerHTML = "No sizes available";
                updateStockDisplay(0);
            }
        } else {
            Notiflix.Notify.failure("Models loading failed!", {
                position: 'center-top'
            });
            document.getElementById("size").disabled = true;

            // Reset price on error
            document.getElementById("product-price").innerHTML = "Error loading sizes";
            updateStockDisplay(0);
        }
    } catch (e) {
        Notiflix.Notify.failure(e.message, {
            position: 'center-top'
        });
        document.getElementById("size").disabled = true;

        // Reset price on error
        document.getElementById("product-price").innerHTML = "Error loading sizes";
        updateStockDisplay(0);
    } finally {
        Notiflix.Loading.remove();
    }
}

function initColorSelection(productId) {
    const colorSwatches = document.querySelectorAll(".product-color-swatch");

    colorSwatches.forEach(swatch => {
        swatch.addEventListener("click", function (e) {
            e.preventDefault();

            colorSwatches.forEach(c => c.classList.remove("active"));
            this.classList.add("active");

            const colorName = this.dataset.name;
            selectedColor = colorName; // Update selected color
            selectedSize = null; // Reset selected size when color changes

            // Show success message
            Notiflix.Notify.success(`Selected color: ${colorName}`, {
                position: 'right-top',
                timeout: 2000
            });

            loadColorHasSize(productId, colorName);
        });
    });
}

function updateStockDisplay(stock) {
    const stockDisplay = document.getElementById("stock-display");
    if (stockDisplay) {
        const stockCount = parseInt(stock) || 0;
        stockDisplay.textContent = stockCount > 0 ? `In stock: ${stockCount} items` : "Out of stock";
        stockDisplay.style.color = stockCount > 0 ? "green" : "red";
    }
}

function initializeSizeDropdown() {
    const sizeSelect = document.getElementById("size");
    const stockDisplayContainer = document.getElementById("stock-display-container");

    if (stockDisplayContainer) {
        stockDisplayContainer.style.display = 'none';
    }

    sizeSelect.disabled = true;

    sizeSelect.addEventListener("click", function (e) {
        if (!selectedColor) {
            e.preventDefault();
            Notiflix.Notify.warning("Please select a color first!", {
                position: 'center-top',
                timeout: 3000
            });

            document.getElementById("product-color").scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });

            const colorSection = document.querySelector('.color-selection');
            if (colorSection) {
                colorSection.style.boxShadow = '0 0 0 3px #ffcc00';
                setTimeout(() => {
                    colorSection.style.boxShadow = '';
                }, 2000);
            }
            return false;
        }
    });

    sizeSelect.addEventListener("focus", function (e) {
        if (!selectedColor) {
            e.preventDefault();
            this.blur();
            Notiflix.Notify.warning("Please select a color first!", {
                position: 'center-top',
                timeout: 3000
            });
        }
    });

    // Add event listener for when size is enabled (after color selection)
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.attributeName === 'disabled') {
                const isDisabled = sizeSelect.disabled;
                if (!isDisabled && stockDisplayContainer) {
                    stockDisplayContainer.style.display = 'block';
                } else if (stockDisplayContainer) {
                    stockDisplayContainer.style.display = 'none';
                }
            }
        });
    });

    observer.observe(sizeSelect, { attributes: true });
}

function initializeHorizontalScroll() {
    const container = document.getElementById("product-thumbs-horizontal-container");
    const scrollLeft = document.querySelector(".scroll-left");
    const scrollRight = document.querySelector(".scroll-right");

    if (!container || !scrollLeft || !scrollRight) return;

    function updateButtons() {
        const isMobile = window.innerWidth < 992;
        if (!isMobile) {
            scrollLeft.classList.add('hidden');
            scrollRight.classList.add('hidden');
            return;
        }

        if (container.scrollLeft <= 0) {
            scrollLeft.classList.add('hidden');
        } else {
            scrollLeft.classList.remove('hidden');
        }

        if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 1) {
            scrollRight.classList.add('hidden');
        } else {
            scrollRight.classList.remove('hidden');
        }
    }

    updateButtons();
    container.addEventListener('scroll', updateButtons);
    scrollLeft.addEventListener('click', () => {
        container.scrollBy({ left: -120, behavior: 'smooth' });
    });
    scrollRight.addEventListener('click', () => {
        container.scrollBy({ left: 120, behavior: 'smooth' });
    });
    window.addEventListener('resize', updateButtons);
}

function initializeVerticalScroll() {
    const container = document.querySelector(".product-thumbs-vertical-container");
    const scrollUp = document.querySelector(".scroll-up");
    const scrollDown = document.querySelector(".scroll-down");

    if (!container || !scrollUp || !scrollDown) return;

    function updateButtons() {
        const isDesktop = window.innerWidth >= 992;
        if (!isDesktop) {
            scrollUp.classList.add('hidden');
            scrollDown.classList.add('hidden');
            return;
        }

        if (container.scrollTop <= 0) {
            scrollUp.classList.add('hidden');
        } else {
            scrollUp.classList.remove('hidden');
        }

        if (container.scrollTop + container.clientHeight >= container.scrollHeight - 1) {
            scrollDown.classList.add('hidden');
        } else {
            scrollDown.classList.remove('hidden');
        }
    }

    updateButtons();
    container.addEventListener('scroll', updateButtons);
    scrollUp.addEventListener('click', () => {
        container.scrollBy({ top: -100, behavior: 'smooth' });
    });
    scrollDown.addEventListener('click', () => {
        container.scrollBy({ top: 100, behavior: 'smooth' });
    });
    window.addEventListener('resize', updateButtons);
}






