let editProductData = {
    productId: null,
    basicInfo: {},
    colors: [],
};

let editColorOptions = [];
let editCommonSizes = [];

const editor2 = new RichTextEditor("editProductDescription");


async function showEditProduct(event, productId) {
    if (event) event.preventDefault();

    document.querySelectorAll('.dynamic-content').forEach(s => s.classList.remove('active'));
    document.getElementById('edit-product-content').classList.add('active');

    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.classList.remove('menu-active');
        link.closest('.dropdown').classList.remove('active');
    });

    editProductData = { productId, basicInfo: {}, colors: [] };

    await Promise.all([editLoadColors(), editLoadSizes(), editLoadCategories()]);
    editInitializeColorOptions();
    editSetupEventListeners();
    await fetchProductForEdit(productId);
}

async function editLoadColors() {
    try {
        const res = await fetch("api/data/colors");
        if (res.ok) {
            const data = await res.json();
            if (data.status) {
                editColorOptions = data.colors.map(c => ({ name: c.name, value: c.hexCode || c.value }));
            }
        }
    } catch (e) { console.error("editLoadColors:", e); }
}

async function editLoadSizes() {
    try {
        const res = await fetch("api/data/sizes");
        if (res.ok) {
            const data = await res.json();
            if (data.status) {
                editCommonSizes = data.sizes.map(s => s.name || s.code);
            }
        }
    } catch (e) {
        Notiflix.Notify.failure(data.message || "Failed to load size");

    }
}


async function editLoadCategories() {
    try {
        const res = await fetch("api/data/category");
        if (res.ok) {
            const data = await res.json();
            const sel = document.getElementById("editProductCategory");
            while (sel.options.length > 1) sel.remove(1);
            if (data.categories && Array.isArray(data.categories)) {
                data.categories.forEach(cat => {
                    const opt = document.createElement("option");
                    opt.value = cat.id;
                    opt.textContent = cat.name;
                    sel.appendChild(opt);
                });
            }
        }
    } catch (e) {
        console.error("editLoadCategories:", e);
    }
}

async function editLoadModels(categoryId, selectedModelId = null) {
    if (!categoryId || categoryId === '0' || categoryId === '') return;
    try {
        const res = await fetch(`api/data/${encodeURIComponent(categoryId)}/models`);
        if (res.ok) {
            const data = await res.json();
            const sel = document.getElementById("editProductModel");
            while (sel.options.length > 1) sel.remove(1);
            if (data.status && data.models) {
                data.models.forEach(m => {
                    const opt = document.createElement("option");
                    opt.value = m.id;
                    opt.textContent = m.name;
                    if (selectedModelId &&
                        (String(m.id) === String(selectedModelId) ||
                            m.name.trim().toLowerCase() === String(selectedModelId).trim().toLowerCase())) {
                        opt.selected = true;
                    }
                    sel.appendChild(opt);
                });
            }
        }
    } catch (e) { console.error("editLoadModels:", e); }
}


async function fetchProductForEdit(productId) {
    Notiflix.Loading.pulse("Loading product...", { clickToClose: false, svgColor: '#6777ef' });
    try {
        const [productRes, sizesRes] = await Promise.all([
            fetch(`api/single-products/product?Id=${productId}`).catch(() => null)
        ]);

        if (!productRes.ok) throw new Error(`HTTP ${productRes.status}`);
        const data = await productRes.json();
        console.log("fetchProductForEdit response:", data);

        if (!data.status) {
            Notiflix.Notify.failure(data.message || "Failed to load product");
            return;
        }

        const product = data.singleProduct;

        product._fetchedSizes = [];
        if (sizesRes && sizesRes.ok) {
            const sizesData = await sizesRes.json();
            console.log("sizes response:", sizesData);
            product._fetchedSizes = sizesData.sizes || sizesData.data || [];
        }

        await renderEditForm(product);

    } catch (e) {
        Notiflix.Notify.failure("Error loading product: " + e.message);
    } finally {
        Notiflix.Loading.remove();
    }
}


async function renderEditForm(product) {

    document.getElementById('editProductTitle').value = product.title || '';
    document.getElementById('editProductSKU').value   = product.sku   || '';

    const badge = document.getElementById('editProductIdBadge');
    if (badge) badge.textContent = '#' + (product.productId || '–');

    const catSel   = document.getElementById('editProductCategory');
    const catValue = product.category || '';
    let catMatched = false;
    for (let i = 0; i < catSel.options.length; i++) {
        if (catSel.options[i].text.trim().toUpperCase() === catValue.trim().toUpperCase() ||
            String(catSel.options[i].value) === String(catValue)) {
            catSel.selectedIndex = i;
            catMatched = true;
            break;
        }
    }
    if (!catMatched) catSel.value = catValue;

    await editLoadModels(catSel.value, null);
    const modelName = product.model || '';
    const modelSel  = document.getElementById('editProductModel');
    for (let i = 0; i < modelSel.options.length; i++) {
        if (modelSel.options[i].text.trim().toLowerCase() === modelName.trim().toLowerCase() ||
            String(modelSel.options[i].value) === String(modelName)) {
            modelSel.selectedIndex = i;
            break;
        }
    }

    editor2.setHTMLCode(product.description || '');


    const rawColors = product.colors || [];
    const rawImages = product.images || [];


    const colorMap = new Map();

    rawColors.forEach((c, i) => {
        const hex    = (c.hexCode || '#000000').toLowerCase();
        const imgUrl = rawImages[i] || null;

        const mappedSizes = (c.sizes || []).map(s => ({
            size:     s.size || '',
            price:    parseFloat(s.price)    || 0,
            quantity: parseInt(s.quantity, 10) || 0
        }));

        const imgEntry = imgUrl ? [{
            name:       imgUrl.split('/').pop(),
            type:       imgUrl.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg',
            size:       0,
            preview:    imgUrl,
            base64Data: imgUrl,
            isExisting: true
        }] : [];

        if (!colorMap.has(hex)) {
            colorMap.set(hex, {
                id:     Date.now() + Math.random(),
                name:   c.name || 'Unknown',
                value:  hex,
                sizes:  mappedSizes,
                images: imgEntry
            });
        } else {
            if (imgUrl) {
                colorMap.get(hex).images.push(imgEntry[0]);
            }
        }
    });

    console.log("editProductData.colors after mapping:", Array.from(colorMap.values()));

    editProductData.colors = Array.from(colorMap.values());

    editUpdateSelectedColorsList();
    editGenerateSizeSections();
    editGenerateImageSections();
}


function editInitializeColorOptions() {
    const grid = document.getElementById('editColorOptionsGrid');
    if (!grid) return;
    grid.innerHTML = '';
    editColorOptions.forEach(color => {
        const div = document.createElement('div');
        div.className = 'color-option';
        div.innerHTML = `
            <div class="color-circle" style="background-color:${color.value};"></div>
            <span class="color-name">${color.name}</span>`;
        div.addEventListener('click', () => editSelectColor(color.name, color.value));
        grid.appendChild(div);
    });
}

function editSelectColor(name, value) {
    if (editProductData.colors.find(c => c.value === value)) {
        Notiflix.Notify.warning(`Color "${name}" already added`);
        return;
    }
    editProductData.colors.push({ id: Date.now() + Math.random(), name, value, sizes: [], images: [] });
    editUpdateSelectedColorsList();
    editGenerateSizeSections();
    editGenerateImageSections();
    document.getElementById('editColorSelectionPanel').style.display = 'none';
}

function editUpdateSelectedColorsList() {
    const container = document.getElementById('editSelectedColorsContainer');
    if (!container) return;
    if (editProductData.colors.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-palette"></i><p>No colors added yet.</p></div>`;
        return;
    }
    container.innerHTML = '<div class="d-flex flex-wrap">' +
        editProductData.colors.map((color, i) => `
            <div class="selected-color-item">
                <div class="color-preview" style="background-color:${color.value}; width:16px; height:16px; border-radius:50%; display:inline-block; margin-right:6px;"></div>
                <span>${color.name}</span>
                <button type="button" class="btn btn-text btn-small" onclick="editRemoveColor(${i})" style="margin-left:8px;">
                    <i class="fas fa-times"></i>
                </button>
            </div>`).join('') + '</div>';
}

function editRemoveColor(index) {
    Notiflix.Confirm.show('Remove Color',
        `Remove "${editProductData.colors[index].name}"? All sizes and images will be lost.`,
        'Yes, Remove', 'Cancel',
        () => {
            editProductData.colors.splice(index, 1);
            editUpdateSelectedColorsList();
            editGenerateSizeSections();
            editGenerateImageSections();
        }
    );
}


function editGenerateSizeSections() {
    const container = document.getElementById('editColorSizesContainer');
    if (!container) return;
    if (editProductData.colors.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-ruler-combined"></i><p>Add colors first.</p></div>`;
        return;
    }
    container.innerHTML = '';
    editProductData.colors.forEach((color, ci) => {
        const section = document.createElement('div');
        section.className = 'color-section mb-4';
        section.id = `edit-color-section-${ci}`;
        section.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5>
                    <div class="color-circle" style="background-color:${color.value}; display:inline-block; margin-right:8px;"></div>
                    ${color.name} – Sizes & Prices
                </h5>
                <button type="button" class="btn btn-outline btn-sm" onclick="editAddSizeRow(${ci})">
                    <i class="fas fa-plus"></i> Add Size
                </button>
            </div>
            <table class="size-price-table">
                <thead>
                    <tr><th>Size</th><th>Price (Rs.)</th><th>Quantity</th><th>Action</th></tr>
                </thead>
                <tbody id="edit-sizes-body-${ci}"></tbody>
            </table>`;
        container.appendChild(section);
        editUpdateSizeRows(ci);
    });
}

function editUpdateSizeRows(ci) {
    const tbody = document.getElementById(`edit-sizes-body-${ci}`);
    if (!tbody) return;
    const color = editProductData.colors[ci];
    if (color.sizes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No sizes yet. Click "Add Size" to add one.</td></tr>`;
        return;
    }
    const selectedSizes = color.sizes.map(s => s.size);
    tbody.innerHTML = color.sizes.map((size, si) => {
        const available = editCommonSizes.filter(s => s === size.size || !selectedSizes.includes(s));
        return `
            <tr class="size-row" id="edit-size-row-${ci}-${si}">
                <td>
                    <select class="form-control form-control-sm"
                            onchange="editUpdateSizeField(${ci},${si},'size',this.value)">
                        <option value="">Select Size</option>
                        ${available.map(s => `<option value="${s}" ${size.size === s ? 'selected' : ''}>${s}</option>`).join('')}
                    </select>
                </td>
                <td>
                    <input type="number" class="form-control form-control-sm"
                           placeholder="0.00" step="0.01" min="0" value="${size.price}"
                           onchange="editUpdateSizeField(${ci},${si},'price',this.value)">
                </td>
                <td>
                    <input type="number" class="form-control form-control-sm"
                           placeholder="0" min="0" value="${size.quantity}"
                           onchange="editUpdateSizeField(${ci},${si},'quantity',this.value)">
                </td>
                <td>
                    <button type="button" class="btn btn-danger btn-sm" onclick="editRemoveSize(${ci},${si})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>`;
    }).join('');
}

function editAddSizeRow(ci) {
    const color = editProductData.colors[ci];
    const taken = color.sizes.map(s => s.size);
    const free  = editCommonSizes.filter(s => !taken.includes(s));
    if (free.length === 0) { Notiflix.Notify.info('All sizes added for this color'); return; }
    color.sizes.push({ size: free[0], price: 0, quantity: 0 });
    editUpdateSizeRows(ci);
}

function editUpdateSizeField(ci, si, field, value) {
    const size = editProductData.colors[ci].sizes[si];
    if (!size) return;
    size[field] = (field === 'price' || field === 'quantity') ? (parseFloat(value) || 0) : value;
}

function editRemoveSize(ci, si) {
    Notiflix.Confirm.show('Remove Size', 'Remove this size?', 'Yes', 'Cancel', () => {
        editProductData.colors[ci].sizes.splice(si, 1);
        editUpdateSizeRows(ci);
    });
}

// ─── IMAGE SECTIONS ──────────────────────────────────────────────────────────

function editGenerateImageSections() {
    const container = document.getElementById('editColorImagesContainer');
    if (!container) return;
    if (editProductData.colors.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-images"></i><p>Add colors first.</p></div>`;
        return;
    }
    container.innerHTML = '';
    editProductData.colors.forEach((color, ci) => {
        const section = document.createElement('div');
        section.className = 'color-section mb-4';
        section.id = `edit-color-image-section-${ci}`;
        section.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5>
                    <div class="color-circle" style="background-color:${color.value}; display:inline-block; margin-right:8px;"></div>
                    ${color.name} – Images
                    <small class="text-muted ml-2">(${color.images.length} images)</small>
                </h5>
                <button type="button" class="btn btn-outline btn-sm"
                        onclick="document.getElementById('edit-image-upload-${ci}').click()">
                    <i class="fas fa-upload"></i> Upload Images
                </button>
            </div>
            <div class="image-upload-area" onclick="document.getElementById('edit-image-upload-${ci}').click()">
                <i class="fas fa-cloud-upload-alt fa-2x mb-3"></i>
                <h5>Click to upload images for ${color.name}</h5>
                <p class="text-muted">Supports JPG, PNG, GIF (Max 5 MB each)</p>
            </div>
            <input type="file" id="edit-image-upload-${ci}" multiple accept="image/*"
                   style="display:none;" onchange="editHandleImageUpload(${ci}, this.files)">
            <div id="edit-image-gallery-${ci}" class="mt-3"></div>`;
        container.appendChild(section);
        editUpdateImageGallery(ci);
    });
}

function editUpdateImageGallery(ci) {
    const gallery = document.getElementById(`edit-image-gallery-${ci}`);
    const color   = editProductData.colors[ci];
    if (!gallery) return;
    if (color.images.length === 0) {
        gallery.innerHTML = '<p class="text-muted text-center">No images uploaded yet</p>';
        return;
    }
    gallery.innerHTML = `<div class="image-gallery-grid">` +
        color.images.map((img, ii) => `
            <div class="image-card">
                <img src="${img.preview}" alt="Image ${ii + 1}">
                ${img.isExisting ? '<div style="position:absolute;top:4px;left:4px;background:#47c363;color:white;font-size:9px;padding:2px 6px;border-radius:30px;">Saved</div>' : ''}
                <div class="image-overlay">
                    <button type="button" class="remove-image-btn" onclick="editRemoveImage(${ci},${ii})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>`).join('') + `</div>`;
}

function editHandleImageUpload(ci, files) {
    const color   = editProductData.colors[ci];
    const maxSize = 5 * 1024 * 1024;
    Array.from(files).forEach(file => {
        if (file.size > maxSize) { Notiflix.Notify.failure(`"${file.name}" exceeds 5 MB`); return; }
        if (!file.type.match('image.*')) { Notiflix.Notify.failure(`"${file.name}" is not a valid image`); return; }
        const reader = new FileReader();
        reader.onload = e => {
            color.images.push({ name: file.name, type: file.type, size: file.size, preview: e.target.result, base64Data: e.target.result, isExisting: false });
            editUpdateImageGallery(ci);
            Notiflix.Notify.success(`"${file.name}" uploaded`);
        };
        reader.readAsDataURL(file);
    });
    document.getElementById(`edit-image-upload-${ci}`).value = '';
}

function editRemoveImage(ci, ii) {
    Notiflix.Confirm.show('Remove Image', 'Remove this image?', 'Yes', 'Cancel', () => {
        editProductData.colors[ci].images.splice(ii, 1);
        editUpdateImageGallery(ci);
    });
}

// ─── EVENT LISTENERS ─────────────────────────────────────────────────────────

function editSetupEventListeners() {
    const addColorBtn = document.getElementById('editAddColorBtn');
    if (addColorBtn) addColorBtn.onclick = () => {
        document.getElementById('editColorSelectionPanel').style.display = 'block';
    };

    const closeColorPanel = document.getElementById('editCloseColorPanel');
    if (closeColorPanel) closeColorPanel.onclick = () => {
        document.getElementById('editColorSelectionPanel').style.display = 'none';
        document.getElementById('editCustomColorName').value = '';
    };

    const addCustomBtn = document.getElementById('editAddCustomColorBtn');
    if (addCustomBtn) addCustomBtn.onclick = editAddCustomColor;

    const catSel = document.getElementById('editProductCategory');
    if (catSel) catSel.onchange = () => editLoadModels(catSel.value);

    const updateBtn = document.getElementById('updateProductBtn');
    if (updateBtn) updateBtn.onclick = updateProduct;

    const cancelBtn = document.getElementById('editCancelBtn');
    if (cancelBtn) cancelBtn.onclick = () => showProductList({ preventDefault: () => {} });
}

function editAddCustomColor() {
    const value = document.getElementById('editCustomColorPicker').value;
    const name  = document.getElementById('editCustomColorName').value.trim();
    if (!name) { Notiflix.Notify.warning('Enter a color name'); return; }
    editSelectColor(name, value);
    document.getElementById('editCustomColorName').value = '';
}

// ─── VALIDATION ──────────────────────────────────────────────────────────────

function editValidate() {
    const title = document.getElementById('editProductTitle').value.trim();
    if (!title) { Notiflix.Notify.warning('Enter a product title'); return false; }
    if (!document.getElementById('editProductCategory').value || document.getElementById('editProductCategory').value === '0') {
        Notiflix.Notify.warning('Select a category'); return false;
    }
    if (editProductData.colors.length === 0) { Notiflix.Notify.warning('Add at least one color'); return false; }
    for (const color of editProductData.colors) {
        if (color.sizes.length === 0) { Notiflix.Notify.warning(`Add at least one size for: ${color.name}`); return false; }
        const seen = new Set();
        for (const s of color.sizes) {
            if (!s.size) { Notiflix.Notify.warning(`Select a size for: ${color.name}`); return false; }
            if (seen.has(s.size)) { Notiflix.Notify.warning(`Duplicate size "${s.size}" in: ${color.name}`); return false; }
            seen.add(s.size);
            if (s.price <= 0) { Notiflix.Notify.warning(`Enter valid price for ${s.size} in: ${color.name}`); return false; }
        }
    }
    return true;
}

// ─── UPDATE ──────────────────────────────────────────────────────────────────

async function updateProduct() {
    if (!editValidate()) return;

    const description = typeof editor2 !== 'undefined'
        ? editor2.getHTMLCode()
        : document.getElementById('editProductDescription').value;

    const finalData = {
        productId: editProductData.productId,
        title:       document.getElementById('editProductTitle').value.trim(),
        description,
        category:    document.getElementById('editProductCategory').value,
        model:       document.getElementById('editProductModel').value,
        sku:         document.getElementById('editProductSKU').value.trim(),
        variants: editProductData.colors.map(color => ({
            color:  { name: color.name, hexCode: color.value },
            sizes:  color.sizes.map(s => ({ size: s.size, price: s.price, quantity: s.quantity })),
            images: color.images.map(img => ({
                fileName:    img.name,
                fileType:    img.type,
                base64Data:  img.isExisting ? null : img.base64Data.split(',')[1],
                fileSize:    img.size,
                isExisting:  img.isExisting,
                url:         img.isExisting ? img.preview : null
            }))
        }))
    };

    Notiflix.Loading.pulse("Updating product...", { clickToClose: false, svgColor: '#6777ef' });
    try {
        const res = await fetch(`api/product/update-product`, {
            method:  "PUT",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body:    JSON.stringify(finalData)
        });

        if (res.ok) {
            const data = await res.json();
            if (data.status) {
                Notiflix.Report.success('Updated!', data.message || 'Product updated successfully.', 'Okay', () => {
                    showProductList({ preventDefault: () => {} });
                });
            } else {
                Notiflix.Notify.failure(data.message || 'Update failed');
            }
        } else {
            const text = await res.text();
            if (text.toLowerCase().includes('<html>')) {
                Notiflix.Report.warning('Session Expired', 'Please log in again.', 'Login', () => {
                    window.location.href = 'adminLogin.html';
                });
            } else {
                Notiflix.Notify.failure(`Server error ${res.status}`);
            }
        }
    } catch (e) {
        Notiflix.Notify.failure("Network error: " + e.message);
    } finally {
        Notiflix.Loading.remove(1000);
    }
}