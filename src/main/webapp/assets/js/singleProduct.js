const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

window.addEventListener("load", async () =>{
    try{

        Notiflix.Loading.pulse("Wait...", {
            clickToClose: false,
            svgColor: '#0284c7'
        });

        await loadSingleProduct();
    }finally {
        Notiflix.Loading.remove();
    }
})

async function loadSingleProduct(){

    try{

        const response = await fetch(`api/single-products/product?Id=${productId}`);

        if(response.ok){
            const data = await response.json();
            if(data.status){

                console.log(data);
                const product = data.singleProduct;

                const mainImage = document.getElementById("product-zoom");

                // Create new image to preload
                const img = new Image();
                img.src = product.images[0];

                img.onload = function() {
                    mainImage.src = product.images[0];
                    mainImage.setAttribute("data-zoom-image", product.images[0]);
                    mainImage.style.maxWidth = '85%';
                    mainImage.style.height = 'auto';

                    // Re-adjust gallery height after image loads
                    setTimeout(adjustGalleryHeight, 100);
                };

                mainImage.src = product.images[0];
                mainImage.setAttribute("data-zoom-image", product.images[0]);

                const thumbnailContainer = document.getElementById("thumbnailContainer");
                thumbnailContainer.innerHTML = "";

                product.images.forEach((image, index) => {
                    const a = document.createElement("a");
                    a.href = "#";
                    a.className = "product-gallery-item" + (index === 0 ? " active" : "");
                    a.setAttribute("data-image", image);
                    a.setAttribute("data-zoom-image", image);

                    const img = document.createElement("img");
                    img.src = image;
                    img.alt = "product image";

                    a.appendChild(img);

                    // click → change main image
                    a.addEventListener("click", (e) => {
                        e.preventDefault();

                        document
                            .querySelectorAll(".product-gallery-item")
                            .forEach(el => el.classList.remove("active"));

                        a.classList.add("active");
                        mainImage.src = image;
                        mainImage.setAttribute("data-zoom-image", image);
                    });

                    thumbnailContainer.appendChild(a);
                });


                const priceHtml = product.minPrice === product.maxPrice ?
                    `Rs.${product.minPrice}.00` :
                    `Rs.${product.minPrice}.00 - Rs.${product.maxPrice}.00`;

                const uniqueColors = [...new Map(product.colors.map(item => [item.hexCode, item])).values()];
                let colorHtml = '';
                uniqueColors.forEach((color, index) => {
                    colorHtml += `<a href="#" class="${index === 0 ? 'active' : ''} mr-2" style="background:${color.hexCode};"><span class="sr-only">${color.name}</span></a>`;
                });

                document.getElementById("product-title").innerHTML = product.title;
                document.getElementById("product-title").innerHTML = product.title;
                document.getElementById("product-price").innerHTML = `${priceHtml}`;
                document.getElementById("product-color").innerHTML = `${colorHtml}`;



            }else{
                Notiflix.Notify.failure(data.message, {
                    position: 'center-top'
                });
            }
        }else{
            Notiflix.Notify.failure("Single Product data loading failed!", {
                position: 'center-top'
            });
        }

    }catch (e){

    }

}