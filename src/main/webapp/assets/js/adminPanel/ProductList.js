
async function LoadProducts(){

    try {
        const response = await fetch("api/data/productTab");
        if (response.ok) {
            const data = await response.json();
            console.log(data);
            renderProductCard(data)
        } else {
            Notiflix.Notify.failure("Product loading failed!", {
                position: 'center-top'
            });
        }
    } catch (e) {
        Notiflix.Notify.failure(e.message, {
            position: 'center-top'
        });
    }

}

function renderProductCard(data) {
    const allProducts = [
        ...(data.productsObject.men || []),
        ...(data.productsObject.women || []),
        ...(data.productsObject.kids || [])
    ];

    const productGrid = document.getElementById("product-grid");
    productGrid.innerHTML = "";

    allProducts.forEach((product, index) => {
        const uniqueColors = product.colors?.reduce((acc, current) => {
            const exists = acc.find(item => item.hexCode === current.hexCode);
            if (!exists) {
                acc.push(current);
            }
            return acc;
        }, []) || [];

        const uniqueSize = product.sizes?.reduce((acc, current) => {
            const exists = acc.find(item => item.size === current.size);
            if (!exists) {
                acc.push(current);
            }
            return acc;
        }, []) || [];

        // Get images array
        const images = product.images || [];

        // Create unique IDs for this product's carousel
        const carouselId = `carousel-${product.productId}-${index}`;
        const prevBtnId = `prev-${product.productId}-${index}`;
        const nextBtnId = `next-${product.productId}-${index}`;

        // Generate image HTML with carousel functionality
        const imageHtml = generateCarouselImages(images, carouselId, product.productId);

        const productCard = `
            <div class="admin-product-card" data-product-id="${product.productId}">
                <div class="product-badge">
                    ${product.isNew ? '<span class="badge badge-new">New</span>' : ''}
                    ${product.discount ? `<span class="badge badge-sale">-${product.discount}%</span>` : ''}
                </div>
                <div class="product-image-container" style="position: relative;">
                    <div class="carousel-container" style="position: relative; width: 100%; height: 100%; overflow: hidden;">
                        <div class="carousel-slides" id="${carouselId}" style="display: flex; transition: transform 0.3s ease; height: 100%;">
                            ${imageHtml}
                        </div>
                        ${images.length > 1 ? `
                            <button class="carousel-prev" id="${prevBtnId}" style="position: absolute; left: 5px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.6); color: white; border: none; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10; transition: all 0.3s;">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            <button class="carousel-next" id="${nextBtnId}" style="position: absolute; right: 5px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.6); color: white; border: none; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10; transition: all 0.3s;">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                            <div class="carousel-dots" style="position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); display: flex; gap: 6px; z-index: 10;">
                                ${images.map((_, imgIndex) => `
                                    <div class="carousel-dot" data-index="${imgIndex}" style="width: 8px; height: 8px; border-radius: 50%; background: ${imgIndex === 0 ? '#6777ef' : 'rgba(255,255,255,0.5)'}; cursor: pointer; transition: all 0.3s;"></div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                    <div class="product-quick-actions">
                        <button class="quick-action-btn" title="Quick View" onclick="quickView(${product.productId})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="quick-action-btn" title="Edit" onclick="editProduct(${product.productId})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="quick-action-btn delete" title="Delete" onclick="deleteProduct(${product.productId})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>

                <div class="product-info">
                    <div class="product-category">
                        <i class="fas fa-tag"></i> ${product.category || 'Uncategorized'}
                    </div>
                    <h5 class="product-title">
                        <a href="javascript:void(0)" onclick="viewProduct(${product.productId})">${product.title || 'Product Title'}</a>
                    </h5>
                    
                    <div class="product-colors">
                        ${uniqueColors.map(color => `
                            <div class="color-dot" 
                                 style="background: ${color.hexCode};" 
                                 title="${color.name}">
                            </div>
                        `).join('')}
                        ${uniqueColors.length === 0 ? '<span class="text-muted">No colors</span>' : ''}
                    </div>
                </div>

                <div class="product-price-stock">
                    <div class="product-price">
                        ${product.maxPrice === product.minPrice
            ? `Rs.${product.maxPrice?.toFixed(2) || '0.00'}`
            : `Rs.${product.minPrice?.toFixed(2) || '0.00'} - Rs.${product.maxPrice?.toFixed(2) || '0.00'}`
        }
                    </div>
                    <div class="product-stock ${product.stock < 10 ? 'low' : ''} ${product.stock === 0 ? 'out' : ''}">
                        ${product.stock > 0 ? `In Stock: ${product.stock}` : 'Out of Stock'}
                    </div>
                </div>

                <div class="product-sizes">
                    ${uniqueSize.map(size => `
                        <span class="size-tag">${size.size}</span>
                    `).join('')}
                    ${uniqueSize.length === 0 ? '<span class="text-muted">No sizes</span>' : ''}
                </div>

                <div class="product-footer">
                    <div class="product-status">
                        <span class="status-indicator ${product.status === 'active' ? 'status-active' : 'status-draft'}"></span>
                        <span>${product.status === 'active' ? 'Active' : 'Draft'}</span>
                    </div>
                    <div class="product-actions">
                        <button class="action-btn edit" title="Edit Product" onclick=" showEditProduct(null, ${product.productId})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn" title="Duplicate" onclick="duplicateProduct(${product.productId})">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="action-btn delete" title="Delete" onclick="deleteProduct(${product.productId})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        productGrid.innerHTML += productCard;
    });

    // Initialize carousels after rendering all cards
    allProducts.forEach((product, index) => {
        const images = product.images || [];
        if (images.length > 1) {
            const carouselId = `carousel-${product.productId}-${index}`;
            const prevBtnId = `prev-${product.productId}-${index}`;
            const nextBtnId = `next-${product.productId}-${index}`;

            // Get carousel elements
            const carousel = document.getElementById(carouselId);
            const prevBtn = document.getElementById(prevBtnId);
            const nextBtn = document.getElementById(nextBtnId);
            const dots = document.querySelectorAll(`#${carouselId} .carousel-dot`);

            if (carousel && prevBtn && nextBtn) {
                initCarousel(carousel, prevBtn, nextBtn, dots);
            }
        }
    });
}

// Helper function to generate carousel images HTML
function generateCarouselImages(images, carouselId, productId) {
    if (!images || images.length === 0) {
        return `
            <div style="min-width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #f8fafd;">
                <i class="fas fa-image" style="font-size: 48px; color: #dee2e6;"></i>
            </div>
        `;
    }

    return images.map((image, imgIndex) => `
        <div class="carousel-slide" style="min-width: 100%; height: 100%; transition: opacity 0.3s ease;">
            <img src="${image}" alt="Product image ${imgIndex + 1}" 
                 style="width: 100%; height: 100%; object-fit: cover;"
                 onerror="this.src='https://via.placeholder.com/300x220/6777ef/ffffff?text=No+Image'">
        </div>
    `).join('');
}

// Initialize carousel with navigation
function initCarousel(carousel, prevBtn, nextBtn, dots) {
    let currentIndex = 0;
    const slides = carousel.querySelectorAll('.carousel-slide');
    const totalSlides = slides.length;

    if (totalSlides <= 1) return;

    // Update carousel position
    function updateCarousel() {
        const offset = -currentIndex * 100;
        carousel.style.transform = `translateX(${offset}%)`;

        // Update dots
        if (dots && dots.length > 0) {
            dots.forEach((dot, idx) => {
                if (idx === currentIndex) {
                    dot.style.background = '#6777ef';
                    dot.style.transform = 'scale(1.2)';
                } else {
                    dot.style.background = 'rgba(255,255,255,0.5)';
                    dot.style.transform = 'scale(1)';
                }
            });
        }

        // Update button visibility
        if (prevBtn && nextBtn) {
            prevBtn.style.opacity = currentIndex === 0 ? '0.5' : '1';
            nextBtn.style.opacity = currentIndex === totalSlides - 1 ? '0.5' : '1';
        }
    }

    // Next slide
    function nextSlide() {
        if (currentIndex < totalSlides - 1) {
            currentIndex++;
            updateCarousel();
        }
    }

    // Previous slide
    function prevSlide() {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    }

    // Go to specific slide
    function goToSlide(index) {
        if (index >= 0 && index < totalSlides) {
            currentIndex = index;
            updateCarousel();
        }
    }

    // Add event listeners
    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        nextSlide();
    });

    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        prevSlide();
    });

    // Add dot click handlers
    if (dots && dots.length > 0) {
        dots.forEach((dot, idx) => {
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                goToSlide(idx);
            });
        });
    }

    // Auto-advance every 5 seconds (optional)
    let autoAdvance = setInterval(() => {
        if (currentIndex < totalSlides - 1) {
            nextSlide();
        } else {
            currentIndex = -1;
            nextSlide();
        }
    }, 5000);

    // Pause auto-advance on hover
    const container = carousel.parentElement;
    container.addEventListener('mouseenter', () => {
        clearInterval(autoAdvance);
    });

    container.addEventListener('mouseleave', () => {
        autoAdvance = setInterval(() => {
            if (currentIndex < totalSlides - 1) {
                nextSlide();
            } else {
                currentIndex = -1;
                nextSlide();
            }
        }, 5000);
    });

    // Initial update
    updateCarousel();
}

// Optional: Add CSS styles for carousel
const carouselStyles = `
    <style>
        .product-image-container {
            position: relative;
            overflow: hidden;
            background: #f8fafd;
        }
        
        .carousel-container {
            position: relative;
            width: 100%;
            height: 100%;
            overflow: hidden;
        }
        
        .carousel-slides {
            display: flex;
            transition: transform 0.3s ease-in-out;
            height: 100%;
        }
        
        .carousel-slide {
            flex-shrink: 0;
            width: 100%;
            height: 100%;
        }
        
        .carousel-slide img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .carousel-prev,
        .carousel-next {
            transition: all 0.3s ease;
            z-index: 10;
        }
        
        .carousel-prev:hover,
        .carousel-next:hover {
            background: rgba(0, 0, 0, 0.8) !important;
            transform: translateY(-50%) scale(1.1);
        }
        
        .carousel-dot {
            transition: all 0.3s ease;
        }
        
        .carousel-dot:hover {
            transform: scale(1.3);
        }
        
        /* Optional: Add loading animation */
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        .carousel-slide img[src=""] {
            animation: pulse 1.5s ease-in-out infinite;
        }
    </style>
`;

// Add styles to document head
if (!document.querySelector('#carousel-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'carousel-styles';
    styleElement.innerHTML = carouselStyles;
    document.head.appendChild(styleElement);
}

// Helper functions for product actions
function quickView(productId) {
    Notiflix.Notify.info(`Quick view for product ${productId}`);
    // Implement quick view modal
}

function editProduct(productId) {
    Notiflix.Notify.info(`Edit product ${productId}`);
    // Navigate to edit page or open edit modal
}

function deleteProduct(productId) {
    Notiflix.Confirm.show(
        'Delete Product',
        'Are you sure you want to delete this product? This action cannot be undone.',
        'Yes, Delete',
        'Cancel',
        function() {
            // Call delete API
            Notiflix.Notify.success(`Product ${productId} deleted successfully`);
        },
        function() {
            Notiflix.Notify.info('Deletion cancelled');
        }
    );
}

function duplicateProduct(productId) {
    Notiflix.Notify.info(`Duplicate product ${productId}`);
    // Implement duplicate functionality
}

function viewProduct(productId) {
    Notiflix.Notify.info(`View product ${productId}`);
    // Navigate to product detail page
}