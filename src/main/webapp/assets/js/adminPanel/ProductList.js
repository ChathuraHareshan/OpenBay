
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

function renderProductCard(data){

    const allProducts = [
        ...(data.productsObject.men || []),
        ...(data.productsObject.women || []),
        ...(data.productsObject.kids || [])
    ];

    const productGrid = document.getElementById("product-grid");

    productGrid.innerHTML = "";



    allProducts.forEach(product =>{

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


       const productCard = `<div class="admin-product-card">
<!--                                <div class="product-badge">-->
<!--                                    <span class="badge badge-new">New</span>-->
<!--                                    <span class="badge badge-sale">-20%</span>-->
<!--                                </div>-->
                                <div class="product-image-container">
                                    <img src="https://via.placeholder.com/300x220/6777ef/ffffff?text=Polo+Shirt" alt="Product" class="product-image">
                                    <div class="product-quick-actions">
                                        <button class="quick-action-btn" title="Quick View">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button class="quick-action-btn" title="Edit">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="quick-action-btn delete" title="Delete">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                                


                                <div class="product-info">
                                    <div class="product-category">${product.category} / T-Shirts</div>
                                    <h5 class="product-title">
                                        <a href="#">${product.title}</a>
                                    </h5>
<!--                                    <div class="product-sku">-->
<!--                                        <i class="fas fa-barcode"></i> SKU: PL-2024-001-->
<!--                                    </div>-->
                                
                                    <div class="product-colors">
                                        ${uniqueColors.map(color => `
                                            <div class="color-dot" 
                                                 style="background: ${color.hexCode};" 
                                                 title="${color.name}">
                                            </div>
                                        `).join('')}
                                        
                                        
                                    </div>
                                </div>

                                    <div class="product-price-stock">
                                        <div class="product-price">
                                            ${product.maxPrice === product.minPrice
                                                       ? `Rs.${product.maxPrice}.00`  
                                                       : `Rs.${product.minPrice}.00 - Rs.${product.maxPrice}.00`  
                                                   }    
                                        </div>
                                        <div class="product-stock">In Stock: 45</div>
                                    </div>

                                    <div class="product-sizes">
                                    
                                    ${uniqueSize.map(size =>`
                                      <span class="size-tag">${size.size}</span>
                                    `).join('')}
                                    </div>

                                    <!-- Footer Actions -->
                                    <div class="product-footer">
                                        <div class="product-status">
                                            <span class="status-indicator status-active"></span>
                                            <span>Active</span>
                                        </div>
                                        <div class="product-actions">
                                            <button class="action-btn edit" title="Edit Product">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="action-btn" title="Duplicate">
                                                <i class="fas fa-copy"></i>
                                            </button>
                                            <button class="action-btn delete" title="Delete">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>`;

       productGrid.innerHTML += productCard;

    });

}