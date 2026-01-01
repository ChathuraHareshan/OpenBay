let productData = {
    basicInfo: {},
    colors: [],
    currentStep: 1
};

let colorOptions = [];
let commonSizes = [];

function loadProductData() {
    loadColors();
    loadSizes();
    loadCategories();

    // Initialize after data is loaded
    setTimeout(() => {
        initializeColorOptions();
        setupEventListeners();
    }, 500);
}

async function loadColors() {
    try {
        const response = await fetch("api/data/colors");
        if (response.ok) {
            const data = await response.json();

            if (data.status) {
                colorOptions = data.colors.map(color => ({
                    name: color.name,
                    value: color.hexCode || color.value
                }));

                console.log("Colors loaded:", colorOptions);
                initializeColorOptions();
            } else {
                Notiflix.Notify.failure("Failed to load colors: " + data.message);
                initializeColorOptions();
            }
        } else {
            Notiflix.Notify.failure("Colors loading failed!");
            initializeColorOptions();
        }
    } catch (e) {
        Notiflix.Notify.failure("Error loading colors: " + e.message);
        initializeColorOptions();
    }
}

async function loadSizes() {
    try {
        const response = await fetch("api/data/sizes");
        if (response.ok) {
            const data = await response.json();

            if (data.status) {
                commonSizes = data.sizes.map(size => size.name || size.code);
                console.log("Sizes loaded:", commonSizes);
            } else {
                Notiflix.Notify.failure("Failed to load sizes: " + data.message);
                commonSizes = getDefaultSizes();
            }
        } else {
            Notiflix.Notify.failure("Sizes loading failed!");
            commonSizes = getDefaultSizes();
        }
    } catch (e) {
        Notiflix.Notify.failure("Error loading sizes: " + e.message);
        commonSizes = getDefaultSizes();
    }
}

async function loadCategories() {
    try {
        const response = await fetch("api/data/category");
        if (response.ok) {
            const data = await response.json();
            console.log("Categories data:", data);

            const productCategory = document.getElementById("productCategory");

            // Clear existing options except the first one
            while (productCategory.options.length > 1) {
                productCategory.remove(1);
            }

            if (data.categories && Array.isArray(data.categories)) {
                data.categories.forEach(category => {
                    const opt = document.createElement("option");
                    opt.value = category.id;
                    opt.textContent = category.name;
                    productCategory.appendChild(opt);
                });
            }
        } else {
            Notiflix.Notify.failure("Category loading failed!");
        }
    } catch (e) {
        Notiflix.Notify.failure(e.message);
    }
}


function initializeColorOptions() {
    const colorGrid = document.getElementById('colorOptionsGrid');
    if (!colorGrid) return;

    // Clear existing options
    colorGrid.innerHTML = '';

    // Add colors from database
    colorOptions.forEach(color => {
        const colorOption = document.createElement('div');
        colorOption.className = 'color-option';
        colorOption.innerHTML = `
            <div class="color-circle" style="background-color: ${color.value};"></div>
            <span class="color-name">${color.name}</span>
        `;
        colorOption.addEventListener('click', () => selectColor(color.name, color.value));
        colorGrid.appendChild(colorOption);
    });
}

function setupEventListeners() {
    // Color management
    const addColorBtn = document.getElementById('addColorBtn');
    if (addColorBtn) {
        addColorBtn.addEventListener('click', () => {
            const panel = document.getElementById('colorSelectionPanel');
            if (panel) panel.style.display = 'block';
        });
    }

    const closeColorPanel = document.getElementById('closeColorPanel');
    if (closeColorPanel) {
        closeColorPanel.addEventListener('click', () => {
            const panel = document.getElementById('colorSelectionPanel');
            if (panel) panel.style.display = 'none';
            const colorNameInput = document.getElementById('customColorName');
            if (colorNameInput) colorNameInput.value = '';
        });
    }

    const addCustomColorBtn = document.getElementById('addCustomColorBtn');
    if (addCustomColorBtn) {
        addCustomColorBtn.addEventListener('click', addCustomColor);
    }

    // Form submission
    const saveProductBtn = document.getElementById('saveProductBtn');
    if (saveProductBtn) {
        saveProductBtn.addEventListener('click', saveProduct);
    }

    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', resetForm);
    }
}

// function goToStep(stepNumber) {
//     // For admin panel, we show everything at once, but we can use this to update data
//     productData.currentStep = stepNumber;
//
//     // Update data when moving between steps
//     if (stepNumber === 1) {
//         saveBasicInfo();
//     } else if (stepNumber === 3) {
//         generateSizeSections();
//     } else if (stepNumber === 4) {
//         generateImageSections();
//     }
// }

// Step 1: Basic Info
function validateStep1() {
    const title = document.getElementById('productTitle')?.value.trim();
    const description = document.getElementById('productDescription')?.value.trim();
    const category = document.getElementById('productCategory')?.value;

    if (!title) {
        alert('Please enter a product title');
        document.getElementById('productTitle')?.focus();
        return false;
    }

    if (!description) {
        alert('Please enter a product description');
        document.getElementById('productDescription')?.focus();
        return false;
    }

    if (!category || category === '0') {
        alert('Please select a category');
        document.getElementById('productCategory')?.focus();
        return false;
    }

    return true;
}


const editor1 = new RichTextEditor("productDescription");

function saveBasicInfo() {
    const titleEl = document.getElementById('productTitle');
    const descEl =  editor1.getHTMLCode();
    const categoryEl = document.getElementById('productCategory');
    const skuEl = document.getElementById('productSKU');

    if (titleEl && descEl && categoryEl) {
        productData.basicInfo = {
            title: titleEl.value,
            description: descEl,
            category: categoryEl.value,
            sku: skuEl ? skuEl.value || '' : ''
        };
    }
}

function selectColor(name, value) {
    // Check if color already selected
    const existingColor = productData.colors.find(c => c.value === value);
    if (existingColor) {
        alert(`Color "${name}" already added`);
        return;
    }

    // Add color to product data
    productData.colors.push({
        id: Date.now() + Math.random(),
        name: name,
        value: value,
        sizes: [],
        images: []
    });

    // Update UI
    updateSelectedColorsList();
    generateSizeSections();
    generateImageSections();

    const panel = document.getElementById('colorSelectionPanel');
    if (panel) panel.style.display = 'none';
}

function addCustomColor() {
    const colorValue = document.getElementById('customColorPicker').value;
    const colorName = document.getElementById('customColorName').value.trim();

    if (!colorName) {
        alert('Please enter a color name');
        return;
    }

    selectColor(colorName, colorValue);
    document.getElementById('customColorName').value = '';
}

function updateSelectedColorsList() {
    const container = document.getElementById('selectedColorsContainer');
    if (!container) return;

    if (productData.colors.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-palette"></i>
                <p>No colors added yet. Click "Add Color" to select colors for your product.</p>
            </div>
        `;
        return;
    }

    let html = '<div class="d-flex flex-wrap">';

    productData.colors.forEach((color, index) => {
        html += `
            <div class="selected-color-item">
                <div class="color-preview" style="background-color: ${color.value};"></div>
                <span class="color-name">${color.name}</span>
                <button type="button" class="btn btn-text btn-small remove-color-btn" onclick="removeColor(${index})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

function removeColor(index) {
    if (confirm('Are you sure you want to remove this color? All sizes and images for this color will also be removed.')) {
        productData.colors.splice(index, 1);
        updateSelectedColorsList();
        generateSizeSections();
        generateImageSections();
    }
}

function validateStep2() {
    if (productData.colors.length === 0) {
        alert('Please add at least one color for your product');
        return false;
    }
    return true;
}

// Step 3: Sizes for Each Color
function generateSizeSections() {
    const container = document.getElementById('colorSizesContainer');
    if (!container) return;

    if (productData.colors.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-ruler-combined"></i>
                <p>Please add colors in the previous step first.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';

    productData.colors.forEach((color, colorIndex) => {
        const colorSection = document.createElement('div');
        colorSection.className = 'color-section mb-4';
        colorSection.id = `color-section-${colorIndex}`;

        colorSection.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5>
                    <div class="color-circle" style="background-color: ${color.value}; display: inline-block; margin-right: 8px;"></div>
                    ${color.name} - Sizes & Prices
                </h5>
                <button type="button" class="btn btn-outline btn-sm" onclick="addSizeRow(${colorIndex})">
                    <i class="fas fa-plus"></i> Add Size
                </button>
            </div>
            
            <table class="size-price-table">
                <thead>
                    <tr>
                        <th>Size</th>
                        <th>Price (Rs.)</th>
                        <th>Quantity</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody id="sizes-body-${colorIndex}">
                    ${color.sizes.length === 0 ? `
                        <tr>
                            <td colspan="4" class="text-center text-muted">No sizes added yet. Click "Add Size" to add sizes for this color.</td>
                        </tr>
                    ` : generateSizeRows(colorIndex)}
                </tbody>
            </table>
        `;

        container.appendChild(colorSection);

        // If color already has sizes, re-render them
        if (color.sizes.length > 0) {
            updateSizeRows(colorIndex);
        }
    });
}

function generateSizeRows(colorIndex) {
    const color = productData.colors[colorIndex];
    let rows = '';

    color.sizes.forEach((size, sizeIndex) => {
        rows += `
            <tr class="size-row" id="size-row-${colorIndex}-${sizeIndex}">
                <td>
                    <select class="form-control form-control-sm size-input" 
                            onchange="updateSizeField(${colorIndex}, ${sizeIndex}, 'size', this.value)">
                        <option value="">Select Size</option>
                        ${commonSizes.map(sizeOption => `
                            <option value="${sizeOption}" ${size.size === sizeOption ? 'selected' : ''}>
                                ${sizeOption}
                            </option>
                        `).join('')}
                    </select>
                </td>
                <td>
                    <input type="number" class="form-control form-control-sm price-input"
                           placeholder="0.00" step="0.01" min="0"
                           value="${size.price}"
                           onchange="updateSizeField(${colorIndex}, ${sizeIndex}, 'price', this.value)">
                </td>
                <td>
                    <input type="number" class="form-control form-control-sm qty-input"
                           placeholder="0" min="0"
                           value="${size.quantity}"
                           onchange="updateSizeField(${colorIndex}, ${sizeIndex}, 'quantity', this.value)">
                </td>
                <td>
                    <button type="button" class="btn btn-danger btn-sm"
                            onclick="removeSize(${colorIndex}, ${sizeIndex})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    return rows;
}

function updateSizeRows(colorIndex) {
    const tbody = document.getElementById(`sizes-body-${colorIndex}`);
    if (tbody) {
        tbody.innerHTML = generateSizeRows(colorIndex);
    }
}

function addSizeRow(colorIndex) {
    const color = productData.colors[colorIndex];

    // Add new size to color with empty size value
    color.sizes.push({
        size: '',
        price: 0,
        quantity: 0
    });

    // Update UI
    updateSizeRows(colorIndex);

    // Remove empty row if it exists
    const emptyRow = document.querySelector(`#sizes-body-${colorIndex} .empty-row`);
    if (emptyRow) {
        emptyRow.remove();
    }

    // Focus on the new size input
    setTimeout(() => {
        const rows = document.querySelectorAll(`#sizes-body-${colorIndex} .size-row`);
        if (rows.length > 0) {
            const lastRow = rows[rows.length - 1];
            lastRow.querySelector('.price-input')?.focus();
        }
    }, 100);
}

function updateSizeField(colorIndex, sizeIndex, field, value) {
    const size = productData.colors[colorIndex].sizes[sizeIndex];
    if (size) {
        if (field === 'price' || field === 'quantity') {
            size[field] = parseFloat(value) || 0;
        } else {
            size[field] = value;
        }
    }
}

function removeSize(colorIndex, sizeIndex) {
    if (confirm('Are you sure you want to remove this size?')) {
        productData.colors[colorIndex].sizes.splice(sizeIndex, 1);
        updateSizeRows(colorIndex);

        // If no sizes left, show empty row
        if (productData.colors[colorIndex].sizes.length === 0) {
            const tbody = document.getElementById(`sizes-body-${colorIndex}`);
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="4" class="text-center text-muted">No sizes added yet. Click "Add Size" to add sizes for this color.</td>
                    </tr>
                `;
            }
        }
    }
}

function validateStep3() {
    for (let i = 0; i < productData.colors.length; i++) {
        const color = productData.colors[i];

        if (color.sizes.length === 0) {
            alert(`Please add at least one size for color: ${color.name}`);
            return false;
        }

        for (let j = 0; j < color.sizes.length; j++) {
            const size = color.sizes[j];

            if (!size.size.trim()) {
                alert(`Please select a size for color: ${color.name}`);
                return false;
            }

            if (size.price <= 0) {
                alert(`Please enter a valid price for size ${size.size} in color: ${color.name}`);
                return false;
            }

            if (size.quantity < 0) {
                alert(`Please enter a valid quantity for size ${size.size} in color: ${color.name}`);
                return false;
            }
        }
    }

    return true;
}

// Step 4: Images
function generateImageSections() {
    const container = document.getElementById('colorImagesContainer');
    if (!container) return;

    if (productData.colors.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-images"></i>
                <p>Please add colors first to upload images.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';

    productData.colors.forEach((color, colorIndex) => {
        const colorSection = document.createElement('div');
        colorSection.className = 'color-section mb-4';
        colorSection.id = `color-image-section-${colorIndex}`;

        colorSection.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5>
                    <div class="color-circle" style="background-color: ${color.value}; display: inline-block; margin-right: 8px;"></div>
                    ${color.name} - Images
                    <small class="text-muted ml-2">(${color.images.length} images)</small>
                </h5>
                <button type="button" class="btn btn-outline btn-sm" onclick="document.getElementById('image-upload-${colorIndex}').click()">
                    <i class="fas fa-upload"></i> Upload Images
                </button>
            </div>
            
            <!-- Image Upload Area -->
            <div class="image-upload-area" onclick="document.getElementById('image-upload-${colorIndex}').click()">
                <i class="fas fa-cloud-upload-alt fa-2x mb-3"></i>
                <h5>Click to upload images for ${color.name}</h5>
                <p class="text-muted">Drag & drop or click to browse</p>
                <p class="text-muted"><small>Supports JPG, PNG, GIF (Max 5MB each)</small></p>
            </div>
            <input type="file" id="image-upload-${colorIndex}" 
                   multiple accept="image/*" 
                   style="display: none;"
                   onchange="handleImageUpload(${colorIndex}, this.files)">
            
            <!-- Image Gallery -->
            <div id="image-gallery-${colorIndex}" class="mt-3">
                ${color.images.length === 0 ? `
                    <p class="text-muted text-center">No images uploaded yet</p>
                ` : generateImageGallery(colorIndex)}
            </div>
        `;

        container.appendChild(colorSection);
    });
}

function generateImageGallery(colorIndex) {
    const color = productData.colors[colorIndex];
    let gallery = '<div class="image-gallery-grid">';

    color.images.forEach((image, imageIndex) => {
        gallery += `
            <div class="image-card">
                <img src="${image.preview}" alt="${color.name} image ${imageIndex + 1}">
                <div class="image-overlay">
                    <button type="button" class="remove-image-btn" onclick="removeImage(${colorIndex}, ${imageIndex})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });

    gallery += '</div>';
    return gallery;
}

function handleImageUpload(colorIndex, files) {
    const color = productData.colors[colorIndex];
    const maxSize = 5 * 1024 * 1024; // 5MB

    Array.from(files).forEach(file => {
        // Check file size
        if (file.size > maxSize) {
            Notiflix.Notify.failure(`"${file.name}" exceeds 5MB limit`);
            return;
        }

        // Check file type
        if (!file.type.match('image.*')) {
            Notiflix.Notify.failure(`"${file.name}" is not a valid image`);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64String = e.target.result;

            color.images.push({
                name: file.name,
                type: file.type,
                size: file.size,
                preview: base64String,
                base64Data: base64String // Keep full data URL for preview
            });

            updateImageGallery(colorIndex);

            Notiflix.Notify.success(`"${file.name}" uploaded`);
        };
        reader.readAsDataURL(file);
    });

    // Clear file input
    document.getElementById(`image-upload-${colorIndex}`).value = '';
}

function updateImageGallery(colorIndex) {
    const gallery = document.getElementById(`image-gallery-${colorIndex}`);
    const color = productData.colors[colorIndex];

    // Update gallery content
    if (gallery) {
        if (color.images.length === 0) {
            gallery.innerHTML = '<p class="text-muted text-center">No images uploaded yet</p>';
        } else {
            gallery.innerHTML = generateImageGallery(colorIndex);
        }
    }
}

function removeImage(colorIndex, imageIndex) {
    if (confirm('Are you sure you want to remove this image?')) {
        productData.colors[colorIndex].images.splice(imageIndex, 1);

        const gallery = document.getElementById(`image-gallery-${colorIndex}`);
        if (gallery) {
            if (productData.colors[colorIndex].images.length === 0) {
                gallery.innerHTML = '<p class="text-muted text-center">No images uploaded yet</p>';
            } else {
                gallery.innerHTML = generateImageGallery(colorIndex);
            }
        }
    }
}

async function saveProduct() {
    // Validate all steps
    if (!validateStep1()) return;
    if (!validateStep2()) return;
    if (!validateStep3()) return;

    // Check if all colors have at least one image
    for (let i = 0; i < productData.colors.length; i++) {
        const color = productData.colors[i];
        if (color.images.length === 0) {
            if (!confirm(`No images uploaded for color: ${color.name}. Continue anyway?`)) {
                return;
            }
            break;
        }
    }

    // Save basic info first
    saveBasicInfo();

    const finalData = {
        title: productData.basicInfo.title,
        description: productData.basicInfo.description,
        category: productData.basicInfo.category,
        sku: productData.basicInfo.sku || '',
        variants: productData.colors.map(color => ({
            color: {
                name: color.name,
                hexCode: color.value
            },
            sizes: color.sizes.map(size => ({
                size: size.size,
                price: size.price,
                quantity: size.quantity
            })),
            images: color.images.map(image => ({
                fileName: image.name,
                fileType: image.type,
                base64Data: image.base64Data.split(',')[1], // Extract base64 data without prefix
                fileSize: image.size
            }))
        }))
    };

    console.log('Product Data to Save:', finalData);

    // Show loading
    Notiflix.Loading.pulse("Saving product...", {
        clickToClose: false,
        svgColor: '#0284c7'
    });

    try {
        const response = await fetch("api/product/add-product", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(finalData)
        });

        const contentType = response.headers.get("content-type");
        if (response.ok && contentType && contentType.indexOf("application/json") !== -1) {
            const data = await response.json();
            if (data.status) {
                Notiflix.Report.success('Success', data.message, 'Okay', () => {
                    resetForm();
                    showDashboard({
                        preventDefault: () => {}
                    });
                });
            } else {
                Notiflix.Notify.failure("Error: " + (data.message || "Unknown error"), {
                    position: 'center-top'
                });
            }
        } else {
            const responseText = await response.text();
            if (responseText.toLowerCase().includes('<html>')) {
                console.error("Server returned HTML instead of JSON. This might be a login redirect.");
                Notiflix.Report.warning(
                    'Session Expired',
                    'Your session has expired. You will be redirected to the login page.',
                    'Okay',
                    () => {
                        window.location.href = 'adminLogin.html';
                    }
                );
            } else {
                Notiflix.Notify.failure(`Server error ${response.status}: ${responseText.substring(0, 100)}`, {
                    position: 'center-top'
                });
            }
        }
    } catch (e) {
        console.error("Network error:", e);
        Notiflix.Notify.failure("Network error: " + e.message, {
            position: 'center-top'
        });
    } finally {
        Notiflix.Loading.remove(1000);
    }
}

function resetForm() {
    // Reset form fields
    const productTitle = document.getElementById('productTitle');
    const productDescription = document.getElementById('productDescription');
    const productCategory = document.getElementById('productCategory');
    const productSKU = document.getElementById('productSKU');

    if (productTitle) productTitle.value = '';
    if (productDescription) productDescription.value = '';
    if (productCategory) productCategory.selectedIndex = 0;
    if (productSKU) productSKU.value = '';

    // Reset product data
    productData = {
        basicInfo: {},
        colors: [],
        currentStep: 1
    };

    // Reset UI
    updateSelectedColorsList();

    const colorSizesContainer = document.getElementById('colorSizesContainer');
    if (colorSizesContainer) {
        colorSizesContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-ruler-combined"></i>
                <p>Please add colors first to set sizes and prices.</p>
            </div>
        `;
    }

    const colorImagesContainer = document.getElementById('colorImagesContainer');
    if (colorImagesContainer) {
        colorImagesContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-images"></i>
                <p>Please add colors first to upload images.</p>
            </div>
        `;
    }
}



document.addEventListener('DOMContentLoaded', function () {
    // Set dashboard as active by default
    showDashboard({preventDefault: () => {}});

    // Initialize feather icons
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
});