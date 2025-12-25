// Product data structure
let productData = {
    basicInfo: {},
    colors: [],
    currentStep: 1
};

let colorOptions = [];
let commonSizes = [];



document.addEventListener('DOMContentLoaded', function() {
    // Load data from database
    loadColors();
    loadSizes();
    loadCategories();

    // Initialize after data is loaded
    setTimeout(() => {
        initializeColorOptions();
        setupEventListeners();
    }, 500);
});

// Load colors from database
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
            } else {
                Notiflix.Notify.failure("Failed to load colors: " + data.message);
                // Fallback to default colors
                colorOptions = getDefaultColors();
            }
        } else {
            Notiflix.Notify.failure("Colors loading failed!");
            colorOptions = getDefaultColors();
        }
    } catch (e) {
        Notiflix.Notify.failure("Error loading colors: " + e.message);
        colorOptions = getDefaultColors();
    }
}

// Load sizes from database
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

// Load categories from database (like your example)
// Load categories from database
async function loadCategories() {

    console.log("category");
    try {
        const response = await fetch("api/data/category");
        if (response.ok) {
            const data = await response.json();
            console.log(data);

            const productCategory = document.getElementById("productCategory");

            data.categories.forEach(category => {

                    const opt = document.createElement("option");
                    opt.value = category.id;
                    opt.textContent = category.name;
                    productCategory.appendChild(opt);

            });

        } else {
            Notiflix.Notify.failure("category loading failed!");
        }
    } catch (e) {
        Notiflix.Notify.failure(e.message);
    }

}

// Fallback default colors (in case API fails)
// function getDefaultColors() {
//     return [
//         { name: 'Red', value: '#ff0000' },
//         { name: 'Blue', value: '#0000ff' },
//         { name: 'Green', value: '#00ff00' },
//         { name: 'Black', value: '#000000' },
//         { name: 'White', value: '#ffffff' },
//         { name: 'Gray', value: '#808080' },
//         { name: 'Yellow', value: '#ffff00' },
//         { name: 'Purple', value: '#800080' },
//         { name: 'Orange', value: '#ffa500' },
//         { name: 'Pink', value: '#ffc0cb' },
//         { name: 'Brown', value: '#a52a2a' },
//         { name: 'Navy Blue', value: '#000080' },
//         { name: 'Sky Blue', value: '#87ceeb' },
//         { name: 'Maroon', value: '#800000' },
//         { name: 'Beige', value: '#f5f5dc' },
//         { name: 'Khaki', value: '#f0e68c' }
//     ];
// }

// Fallback default sizes (in case API fails)
// function getDefaultSizes() {
//     return ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'One Size'];
// }

// Rest of your existing functions remain the same...
// function initializeColorOptions() {
//     const colorGrid = document.getElementById('colorOptionsGrid');
//     if (!colorGrid) return;
//
//     // Clear existing options
//     colorGrid.innerHTML = '';
//
//     // Add colors from database
//     colorOptions.forEach(color => {
//         const colorOption = document.createElement('div');
//         colorOption.className = 'color-option';
//         colorOption.innerHTML = `
//             <div class="color-circle" style="background-color: ${color.value};"></div>
//             <span class="color-name">${color.name}</span>
//         `;
//         colorOption.addEventListener('click', () => selectColor(color.name, color.value));
//         colorGrid.appendChild(colorOption);
//     });
// }



// Update the size datalist initialization
window.addEventListener('load', function() {
    if (!document.getElementById('sizeOptionsList')) {
        const sizeDatalist = document.createElement('datalist');
        sizeDatalist.id = 'sizeOptionsList';

        // Add sizes from database
        commonSizes.forEach(size => {
            const option = document.createElement('option');
            option.value = size;
            sizeDatalist.appendChild(option);
        });

        document.body.appendChild(sizeDatalist);
    }
});





















document.addEventListener('DOMContentLoaded', function() {
    initializeColorOptions();
    setupEventListeners();
});

function initializeColorOptions() {
    const colorGrid = document.getElementById('colorOptionsGrid');
    if (!colorGrid) return;

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
    // Step navigation
    document.getElementById('nextToStep2')?.addEventListener('click', goToStep2);
    document.getElementById('backToStep1')?.addEventListener('click', () => goToStep(1));
    document.getElementById('backToStep1Bottom')?.addEventListener('click', () => goToStep(1));
    document.getElementById('nextToStep3')?.addEventListener('click', goToStep3);
    document.getElementById('backToStep2')?.addEventListener('click', () => goToStep(2));
    document.getElementById('backToStep2Bottom')?.addEventListener('click', () => goToStep(2));
    document.getElementById('nextToStep4')?.addEventListener('click', goToStep4);
    document.getElementById('backToStep3')?.addEventListener('click', () => goToStep(3));
    document.getElementById('backToStep3Bottom')?.addEventListener('click', () => goToStep(3));

    // Color management
    document.getElementById('addColorBtn')?.addEventListener('click', () => {
        const panel = document.getElementById('colorSelectionPanel');
        if (panel) panel.style.display = 'block';
    });

    document.getElementById('closeColorPanel')?.addEventListener('click', () => {
        const panel = document.getElementById('colorSelectionPanel');
        if (panel) panel.style.display = 'none';
        const colorNameInput = document.getElementById('customColorName');
        if (colorNameInput) colorNameInput.value = '';
    });

    document.getElementById('addCustomColorBtn')?.addEventListener('click', addCustomColor);

    // Form submission
    document.getElementById('saveProductBtn')?.addEventListener('click', saveProduct);
    document.getElementById('cancelBtn')?.addEventListener('click', resetForm);
}

// Step Navigation Functions
function goToStep(stepNumber) {
    // Hide all steps
    document.querySelectorAll('.form-step').forEach(step => {
        step.style.display = 'none';
    });

    // Show current step
    const stepElement = document.getElementById(`step${stepNumber}`);
    if (stepElement) {
        stepElement.style.display = 'block';
        productData.currentStep = stepNumber;

        // Update data when moving between steps
        if (stepNumber === 1) {
            saveBasicInfo();
        } else if (stepNumber === 3) {
            generateSizeSections();
        } else if (stepNumber === 4) {
            generateImageSections();
        }
    }
}

function goToStep2() {
    if (validateStep1()) {
        saveBasicInfo();
        goToStep(2);
    }
}

function goToStep3() {
    if (validateStep2()) {
        goToStep(3);
    }
}

function goToStep4() {
    if (validateStep3()) {
        goToStep(4);
    }
}

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

    if (!category) {
        alert('Please select a category');
        document.getElementById('productCategory')?.focus();
        return false;
    }

    return true;
}

function saveBasicInfo() {
    productData.basicInfo = {
        title: document.getElementById('productTitle').value,
        description: document.getElementById('productDescription').value,
        category: document.getElementById('productCategory').value,
        sku: document.getElementById('productSKU').value || ''
    };
}

// Step 2: Color Selection
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

    let html = '<div class="selected-colors-grid">';

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

        // Regenerate sections if we're on step 3 or 4
        if (productData.currentStep === 3) {
            generateSizeSections();
        } else if (productData.currentStep === 4) {
            generateImageSections();
        }
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
        colorSection.className = 'color-size-section';
        colorSection.id = `color-section-${colorIndex}`;

        colorSection.innerHTML = `
            <div class="section-header">
                <div class="color-title">
                    <div class="color-indicator" style="background-color: ${color.value};"></div>
                    <h4>${color.name} - Sizes & Prices</h4>
                </div>
                <button type="button" class="btn btn-outline btn-small add-size-btn" onclick="addSizeRow(${colorIndex})">
                    <i class="fas fa-plus"></i> Add Size
                </button>
            </div>

            <div class="sizes-table-container">
                <table class="sizes-table">
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
                            <tr class="empty-row">
                                <td colspan="4">
                                    <div class="empty-sizes">
                                        <i class="fas fa-ruler-combined"></i>
                                        <p>No sizes added yet. Click "Add Size" to add sizes for this color.</p>
                                    </div>
                                </td>
                            </tr>
                        ` : generateSizeRows(colorIndex)}
                    </tbody>
                </table>
            </div>
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
                    <select class="form-control size-input" 
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
                    <input type="number" class="form-control price-input"
                           placeholder="0.00" step="0.01" min="0"
                           value="${size.price}"
                           onchange="updateSizeField(${colorIndex}, ${sizeIndex}, 'price', this.value)">
                </td>
                <td>
                    <input type="number" class="form-control qty-input"
                           placeholder="0" min="0"
                           value="${size.quantity}"
                           onchange="updateSizeField(${colorIndex}, ${sizeIndex}, 'quantity', this.value)">
                </td>
                <td>
                    <button type="button" class="btn btn-text btn-small remove-size-btn"
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
            lastRow.querySelector('.price-input').focus(); // Focus on price instead of size
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
                    <tr class="empty-row">
                        <td colspan="4">
                            <div class="empty-sizes">
                                <i class="fas fa-ruler-combined"></i>
                                <p>No sizes added yet. Click "Add Size" to add sizes for this color.</p>
                            </div>
                        </td>
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
                alert(`Please enter size for color: ${color.name}`);
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
                <p>Please add colors and sizes in the previous steps first.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';

    productData.colors.forEach((color, colorIndex) => {
        const colorSection = document.createElement('div');
        colorSection.className = 'color-image-section';
        colorSection.id = `color-image-section-${colorIndex}`;

        colorSection.innerHTML = `
            <div class="section-header">
                <div class="color-title">
                    <div class="color-indicator" style="background-color: ${color.value};"></div>
                    <h4>${color.name} - Product Images</h4>
                    <span class="image-count">(${color.images.length} images)</span>
                </div>
                <button type="button" class="btn btn-outline btn-small upload-images-btn" onclick="openImageUploader(${colorIndex})">
                    <i class="fas fa-upload"></i> Upload Images
                </button>
            </div>

            <div class="image-upload-area" id="image-upload-area-${colorIndex}" style="display: none;">
                <div class="upload-box" onclick="triggerImageUpload(${colorIndex})">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <h5>Click to upload images</h5>
                    <p>Drag & drop images or click to browse</p>
                    <p class="upload-hint">Supports JPG, PNG, GIF (Max 5MB each)</p>
                </div>
                <input type="file" id="image-upload-${colorIndex}" multiple accept="image/*" style="display: none;"
                       onchange="handleImageUpload(${colorIndex}, this.files)">
            </div>

            <div class="color-image-container">
                <div class="image-gallery" id="image-gallery-${colorIndex}">
                    ${color.images.length === 0 ? `
                        <div class="empty-gallery">
                            <i class="fas fa-image"></i>
                            <p>No images uploaded yet</p>
                        </div>
                    ` : generateImageGallery(colorIndex)}
                </div>
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

function openImageUploader(colorIndex) {
    const uploadArea = document.getElementById(`image-upload-area-${colorIndex}`);
    if (uploadArea) {
        uploadArea.style.display = uploadArea.style.display === 'none' ? 'block' : 'none';
    }
}

function triggerImageUpload(colorIndex) {
    document.getElementById(`image-upload-${colorIndex}`).click();
}

function handleImageUpload(colorIndex, files) {
    const color = productData.colors[colorIndex];
    const maxSize = 5 * 1024 * 1024; // 5MB

    for (let file of files) {
        // Check file size
        if (file.size > maxSize) {
            Notiflix.Notify.failure(`File "${file.name}" exceeds 5MB limit`, {
                position: 'center-top'
            });
            continue;
        }

        // Check file type
        if (!file.type.match('image.*')) {
            Notiflix.Notify.failure(`File "${file.name}" is not a valid image`, {
                position: 'center-top'
            });
            continue;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64String = e.target.result;

            color.images.push({
                name: file.name,
                type: file.type,
                size: file.size,
                preview: base64String,  // Full data URL for preview
                base64Data: base64String  // Full data URL for backend
            });

            updateImageGallery(colorIndex);
        };
        reader.readAsDataURL(file);
    }

    // Clear file input
    document.getElementById(`image-upload-${colorIndex}`).value = '';
    const uploadArea = document.getElementById(`image-upload-area-${colorIndex}`);
    if (uploadArea) uploadArea.style.display = 'none';
}

function updateImageGallery(colorIndex) {
    const gallery = document.getElementById(`image-gallery-${colorIndex}`);
    const color = productData.colors[colorIndex];

    // Update image count in header
    const imageCountElement = document.querySelector(`#color-image-section-${colorIndex} .image-count`);
    if (imageCountElement) {
        imageCountElement.textContent = `(${color.images.length} images)`;
    }

    // Update gallery content
    if (gallery) {
        if (color.images.length === 0) {
            gallery.innerHTML = `
                <div class="empty-gallery">
                    <i class="fas fa-image"></i>
                    <p>No images uploaded yet</p>
                </div>
            `;
        } else {
            gallery.innerHTML = generateImageGallery(colorIndex);
        }
    }
}

function removeImage(colorIndex, imageIndex) {
    if (confirm('Are you sure you want to remove this image?')) {
        productData.colors[colorIndex].images.splice(imageIndex, 1);
        updateImageGallery(colorIndex);

        // If no images left, show empty gallery
        if (productData.colors[colorIndex].images.length === 0) {
            const gallery = document.getElementById(`image-gallery-${colorIndex}`);
            if (gallery) {
                gallery.innerHTML = `
                    <div class="empty-gallery">
                        <i class="fas fa-image"></i>
                        <p>No images uploaded yet</p>
                    </div>
                `;
            }
        }
    }
}

// Main Save Product Function
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

    const finalData = {
        title: productData.basicInfo.title,
        description: productData.basicInfo.description,
        category: productData.basicInfo.category,
        sku: productData.basicInfo.sku || '',
        variants: productData.colors.map(color => ({
            color: {
                name: color.name,
                hexCode: color.value // Using 'hexCode' to match your DTO
            },
            sizes: color.sizes.map(size => ({
                size: size.size,
                price: size.price,
                quantity: size.quantity
            })),
            images: color.images.map(image => ({
                fileName: image.name,
                fileType: image.type,
                base64Data: image.base64Data, // Make sure to store base64
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
                "Content-Type": "application/json"
            },
            body: JSON.stringify(finalData)
        });

        // Log response for debugging
        console.log("Response status:", response.status);
        console.log("Response headers:", response.headers);

        if (response.ok) {
            const data = await response.json();
            console.log("Response data:", data);

            if (data.status) {
                Notiflix.Report.success('Openbay', data.message, 'Okay');
                resetForm();
                document.querySelector('.nav-link[data-tab="products"]').click();
            } else {
                Notiflix.Notify.failure("Error: " + data.message, {
                    position: 'center-top'
                });
            }
        } else {
            // Try to get error details
            const errorText = await response.text();
            console.error("Server error details:", errorText);
            Notiflix.Notify.failure("Server error: " + response.status + " - " + errorText, {
                position: 'center-top'
            });
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
    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.reset();
    }

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
                <p>Please add colors in the previous step first.</p>
            </div>
        `;
    }

    const colorImagesContainer = document.getElementById('colorImagesContainer');
    if (colorImagesContainer) {
        colorImagesContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-images"></i>
                <p>Please add colors and sizes in the previous steps first.</p>
            </div>
        `;
    }

    // Go back to step 1
    goToStep(1);
}

// Initialize size datalist
window.addEventListener('load', function() {
    if (!document.getElementById('sizeOptionsList')) {
        const sizeDatalist = document.createElement('datalist');
        sizeDatalist.id = 'sizeOptionsList';
        commonSizes.forEach(size => {
            const option = document.createElement('option');
            option.value = size;
            sizeDatalist.appendChild(option);
        });
        document.body.appendChild(sizeDatalist);
    }
});

// function handleImageUpload(colorIndex, files) {
//     const color = productData.colors[colorIndex];
//     const maxSize = 5 * 1024 * 1024; // 5MB
//
//     for (let file of files) {
//         // Check file size
//         if (file.size > maxSize) {
//             Notiflix.Notify.failure(`File "${file.name}" exceeds 5MB limit`, {
//                 position: 'center-top'
//             });
//             continue;
//         }
//
//         // Check file type
//         if (!file.type.match('image.*')) {
//             Notiflix.Notify.failure(`File "${file.name}" is not a valid image`, {
//                 position: 'center-top'
//             });
//             continue;
//         }
//
//         // Create preview and base64 data
//         const reader = new FileReader();
//         reader.onload = (e) => {
//             const base64String = e.target.result;
//
//             color.images.push({
//                 name: file.name,
//                 type: file.type,
//                 size: file.size,
//                 preview: base64String,
//                 base64Data: base64String.split(',')[1] // Remove the data URL prefix
//             });
//
//             // Update gallery
//             updateImageGallery(colorIndex);
//         };
//         reader.readAsDataURL(file);
//     }
//
//     // Clear file input
//     document.getElementById(`image-upload-${colorIndex}`).value = '';
//     const uploadArea = document.getElementById(`image-upload-area-${colorIndex}`);
//     if (uploadArea) uploadArea.style.display = 'none';
// }