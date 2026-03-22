const params = new URLSearchParams(window.location.search);

const orderId = params.get("orderId");

window.addEventListener("load", async () => {
    if (orderId) {
        await loadInvoiceData(orderId);
    }
});

async function loadInvoiceData(orderId){

    try {
        Notiflix.Loading.pulse("Wait...", {
            clickToClose: false,
            svgColor: '#0284c7'
        });

        const response = await fetch(`api/invoices/user-invoice?orderId=${orderId}`);
        if (response.ok) {
            const data = await response.json();
            if (data.status) {
                console.log(data);
                const invoice = data.invoiceData;

                document.getElementById("invoiceNumber").innerHTML = invoice.invoiceNo;
                document.getElementById("invoice-date").innerHTML = `Issued: ` + invoice.invoiceDate ;
                document.getElementById("userName").innerHTML = invoice.buyerName;
                document.getElementById("address").innerHTML = invoice.lineOne + `<br>
                    ` + invoice.lineTwo + `, ` + invoice.cityName + `<br>
                    ` + invoice.pcode;
                document.getElementById("contact").innerHTML = `<a href="mailto:` + invoice.email + `">` + invoice.email + `</a><br>
                    ` + invoice.mobile;
                document.getElementById("orderInfo").innerHTML =  `<strong>Order ID:</strong> ` + invoice.invoiceNo  + ` <br>
                    <strong>Currency:</strong> LKR<br>`;


                let itemBody = document.getElementById("itemBody");
                let subtotal = 0;

                invoice.invoiceItemDTOList.forEach((item, index) => {

                    let totalItemPrice = item.itemPrice * item.itemQty;

                    itemBody.innerHTML += `<tr>
                    <td>
                        <div class="product-cell">
                            <div>
                                <div class="product-info-name">${item.itemName}</div>
                                <div class="product-tags">
                                    <span class="tag tag-size" id="size">Size: ${item.sizeName}</span>
                                    <span class="tag tag-color" id="color">● ${item.colorName}</span>
                                </div>
                            </div>
                        </div>
                    </td>
                    <td><span class="price-mono" id="qty">× ${item.itemQty}</span></td>
                    <td><span class="price-mono" id="price">Rs. ${new Intl.NumberFormat("en-US", {
                        minimumFractionDigits: 2
                    }).format(item.itemPrice)}</span></td>
                    
                    <td><span class="price-mono" style="font-weight:600;color:var(--ink)" id="total">Rs. ${new Intl.NumberFormat("en-US", {
                        minimumFractionDigits: 2
                    }).format(totalItemPrice)}</span></td>
                </tr>`;
                    subtotal += totalItemPrice;
                });


                document.getElementById("subTotal").innerHTML = new Intl.NumberFormat("en-US", {
                    minimumFractionDigits: 2
                }).format(subtotal);

                document.getElementById("shipping").innerHTML = new Intl.NumberFormat("en-US", {
                    minimumFractionDigits: 2
                }).format(invoice.shippingCharges);

                document.getElementById("dueTotal").innerHTML = new Intl.NumberFormat("en-US", {
                    minimumFractionDigits: 2
                }).format(subtotal + invoice.shippingCharges);


                document.getElementById("deliverName").innerHTML = invoice.buyerName;

                document.getElementById("deliverAddress").innerHTML = invoice.address;

                document.getElementById("deliverName").innerHTML = invoice.cityName;

                document.getElementById("pcode").innerHTML = invoice.pcode;


            } else {
                Notiflix.Notify.failure(data.message, {
                    position: 'center-top'
                });
            }
        } else {
            Notiflix.Notify.failure("Invoice Data loading failed!", {
                position: 'center-top'
            });
        }
    } catch (e) {
        Notiflix.Notify.failure(e.message, {
            position: 'center-top'
        });
    } finally {
        Notiflix.Loading.remove();
    }

}