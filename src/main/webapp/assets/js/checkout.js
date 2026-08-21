    window.addEventListener("load", async () => {
        try {
            Notiflix.Loading.pulse("Wait...", {
                clickToClose: false,
                svgColor: '#0284c7'
            });


            await getCities();
            await loadCheckoutData();

            const shippingData = JSON.parse(sessionStorage.getItem("selectedShipping"));

            if (!shippingData) {
                alert("Please select a shipping method");
                window.location.href = "cart.html";
                return;
            }

            document.getElementById("shipping-method").innerText = shippingData.label;
            document.getElementById("shipping-price").innerText = `Rs. ${shippingData.price.toFixed(2)}`;


        } finally {
            Notiflix.Loading.remove();
        }
    });

    async function loadCheckoutData() {
        try {
            const response = await fetch("api/checkouts/user-checkout-data")
            if (response.redirected) {
                Notiflix.Report.info(
                    'Checkout Info Message',
                    'Please login first!',
                    'Ok',
                    () => {
                        window.location = "login.html";
                    }
                );
                return;
            }
            if (response.ok) {
                const data = await response.json();
                if (data.status) {
                    console.log(data);
                    fillUserCurrentAddress(data.userPrimaryAddress);
                    makeOrderSummary(data.cartList);
                    renderPriceSummaryPanel(
                        data.subTotal,
                        data.totalQty,
                    );
                } else {
                    Notiflix.Notify.failure(data.message, {
                        position: 'center-top'
                    });
                }
            } else {
                Notiflix.Notify.failure("Checkout data loading failed!", {
                    position: 'center-top'
                });
            }
        } catch (e) {
            Notiflix.Notify.failure(e.message, {
                position: 'center-top'
            });
        }
    }

    function makeOrderSummary(data) {
        const checkoutItemBody = document.getElementById("checkout-data-body");
        checkoutItemBody.innerHTML = "";

        data.forEach(item => {
            checkoutItemBody.innerHTML += `
            <tr>
                <td>
                    <div class="product-item-details">
                        <div class="product-name">
                            <a href="#">${item.title}</a>
                        </div>
                        <div class="product-attributes">
                            <div class="nav product-nav-dots" id="product-color">
                                <a href="#"
                                   class="product-color-swatch active mr-2"
                                   data-hex="${item.color}"
                                   style="background: ${item.color};">
                                    <span class="sr-only">${item.colorName || 'Color'}</span>
                                </a>
                                <span class="size-label mr-3">${item.size}</span>
                            </div>
                        </div>
                        <div class="product-price-info mt-2">
                            <span class="unit-price">Unit Price: ${item.price}</span>
                            <span class="separator"> | </span>
                            <span class="order-quantity">Order Quantity: ${item.qty}</span>
                        </div>
                    </div>
                </td>
                <td class="total-price">Rs. ${item.totalPrice.toFixed(2)}</td>
            </tr>
        `;
        });

        const subTotal = data.subTotal;
        const totalQty = data.totalQty;

        renderPriceSummaryPanel(subTotal, subTotal);


    }

    function renderPriceSummaryPanel(subTotal){

        const summaryPanel = document.getElementById("checkout-price-summary");
        summaryPanel.innerHTML = "";

        const NumberSubTotal = Number(subTotal) || 0;

        const shippingData = JSON.parse(sessionStorage.getItem("selectedShipping")) || {
            price: 0,
            label: "Not Selected"
        };

        const shippingPrice = Number(shippingData.price) || 0;
        const finalTotal = NumberSubTotal + shippingPrice;

        summaryPanel.innerHTML += `<tr class="summary-subtotal">
          <td>Subtotal:</td>
            <td>Rs. ${NumberSubTotal.toFixed(2)}</td>
              </tr>
              <tr>
             <td>Shipping:</td>
            <td>${shippingData.label} <br> Rs. ${shippingPrice.toFixed(2)}</td>
              </tr>
              <tr class="summary-total">
              <td>Total:</td>
            <td>Rs. ${finalTotal.toFixed(2)}</td>
              </tr>`

    }

    function fillUserCurrentAddress(address) {
        const currentAddressTick = document.getElementById("checkout-use-primary");

        currentAddressTick.checked = true;

        let fname = document.getElementById("fname");
        let lname = document.getElementById("lname");
        let email = document.getElementById("email");
        let line1 = document.getElementById("line1");
        let line2 = document.getElementById("line2");
        let pcode = document.getElementById("pcode");
        let city = document.getElementById("citySelect");
        let mobile = document.getElementById("mobile");

        fname.value = address.firstName;
        lname.value = address.lastName;
        email.value = address.email;
        line1.value = address.lineOne;
        line2.value = address.lineTwo;
        pcode.value = address.postalCode;
        city.value = address.cityId;
        mobile.value = address.mobile;

        fname.disabled = true;
        lname.disabled = true;
        email.disabled = true;
        city.disabled = true;
        line1.disabled = true;
        line2.disabled = true;
        pcode.disabled = true;
        mobile.disabled = true;

        city.dispatchEvent(new Event("change"));


        currentAddressTick.addEventListener("change", () => {
            if (currentAddressTick.checked) {
                fname.value = address.firstName;
                lname.value = address.lastName;
                email.value = address.email;
                line1.value = address.lineOne;
                line2.value = address.lineTwo;
                pcode.value = address.postalCode;
                city.value = address.cityId;
                mobile.value = address.mobile;

                fname.disabled = true;
                lname.disabled = true;
                email.disabled = true;
                city.disabled = true;
                line1.disabled = true;
                line2.disabled = true;
                pcode.disabled = true;
                mobile.disabled = true;

                city.dispatchEvent(new Event("change"));
            } else {
                fname.value = "";
                lname.value = "";
                email.value = "";
                line1.value = "";
                line2.value = "";
                pcode.value = "";
                city.value = "";
                mobile.value = "";

                city.disabled = false;
                fname.disabled = false;
                lname.disabled = false;
                email.disabled = false;
                line1.disabled = false;
                line2.disabled = false;
                pcode.disabled = false;
                mobile.disabled = false;

                city.dispatchEvent(new Event("change"));
            }
        });
    }

    async function getCities() {
        console.log("category");
        try {
            const response = await fetch("api/data/cities");
            if (response.ok) {
                const data = await response.json();

                const citySelect = document.getElementById("citySelect");

                data.cities.forEach(city => {

                    if (citySelect) {
                        const opt1 = document.createElement("option");
                        opt1.value = city.id;
                        opt1.textContent = city.name;
                        citySelect.appendChild(opt1);
                    }


                });

            } else {
                Notiflix.Notify.failure("City loading failed!");
            }
        } catch (e) {
            Notiflix.Notify.failure(e.message);
        }
    }


    async function checkOut(){

        const shippingData = JSON.parse(sessionStorage.getItem("selectedShipping"));

        let firstName = document.getElementById("fname");
        let lastName = document.getElementById("lname");
        let email = document.getElementById("email");
        let lineOne = document.getElementById("line1");
        let lineTwo = document.getElementById("line2");
        let city = document.getElementById("citySelect");
        let postalCode = document.getElementById("pcode");
        let mobile = document.getElementById("mobile");
        let currentAddressTick = document.getElementById("checkout-use-primary");

        const checkoutData = {
            firstName: firstName.value,
            lastName: lastName.value,
            email: email.value,
            lineOne: lineOne.value,
            lineTwo: lineTwo.value,
            city: city.value,
            postalCode: postalCode.value,
            mobile: mobile.value,
            isCurrentAddress: currentAddressTick.checked,
            shippingFee: parseFloat(shippingData.price)
        }


        try {
            Notiflix.Loading.pulse("Wait...", {
                clickToClose: false,
                svgColor: '#0284c7'
            });

            const response = await fetch("api/checkouts/user-checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(checkoutData)
            })

            const responseText = await response.text();
            console.log("response:", responseText);

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error("Failed to parse JSON:", responseText);
            }

            if (response.ok) {
                if (data.status) {
                    console.log("Checkout success:", data);
                    payhere.startPayment(data.paymentDetails);
                    Notiflix.Notify.success("Checkout successful!", {
                        position: 'center-top'
                    });
                } else {
                    Notiflix.Notify.failure(data.message || "Checkout failed", {
                        position: 'center-top'
                    });
                }
            } else {
                Notiflix.Notify.failure(`Server error: ${response.status} - ${data.message || "Unknown error"}`, {
                    position: 'center-top'
                });
            }
        } catch (e) {
            console.error("Checkout error:", e);
            Notiflix.Notify.failure(e.message || "Checkout process failed!", {
                position: 'center-top'
            });
        } finally {
            Notiflix.Loading.remove();
        }
    }

    payhere.onCompleted = async function onCompleted(orderId) {
        console.log("Payment completed. OrderID:" + orderId);
        await verifyOrder(orderId);
    };

    payhere.onDismissed = function onDismissed() {
        console.log("Payment dismissed");
    };


    payhere.onError = function onError(error) {
        console.log("Error:" + error);
    };

    async function verifyOrder(orderId) {
        try {
            const response = await fetch(`api/orders/verify-order?orderId=${orderId}`);
            if (response.ok) {
                const data = await response.json();
                if (data.status) {
                    window.location = `invoice.html?orderId=${orderId}`;
                } else {
                    console.log("invoicce failed.")
                }

            } else {
                Notiflix.Notify.failure("Order verifying failed!", {
                    position: 'center-top'
                });
            }
        } catch (e) {
            Notiflix.Notify.failure(e.message, {
                position: 'center-top'
            });
        }
    }
