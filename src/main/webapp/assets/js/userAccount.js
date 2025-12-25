const addressMap = {};
let editingAddressId = null;


window.addEventListener("load", async () => {
    Notiflix.Loading.pulse("Data is loading", {
        clickToClose: false,
        svgColor: '#0284c7'
    });
    try {
        await getCities();

    } finally {
        Notiflix.Loading.remove();
    }
});

document.getElementById("profile-anchor").addEventListener("click", async () => {
    Notiflix.Loading.pulse("Loading...", {
        clickToClose: false,
        svgColor: '#0284c7'
    });

    try {

        await loadUserData();

    } finally {
        Notiflix.Loading.remove();
    }

});

document.getElementById("address-anchor").addEventListener("click", async () => {
    Notiflix.Loading.pulse("Loading...", {
        clickToClose: false,
        svgColor: '#0284c7'
    });

    try {

        await loadAddress();
        // await getCities();


    } finally {
        Notiflix.Loading.remove();
    }

});

document.getElementById("profile-anchor-mobile").addEventListener("click", async () => {
    Notiflix.Loading.pulse("Loading...", {
        clickToClose: false,
        svgColor: '#0284c7'
    });

    try {

        await loadUserData();

    } finally {
        Notiflix.Loading.remove();
    }

});

document.getElementById("address-anchor-mobile").addEventListener("click", async () => {
    Notiflix.Loading.pulse("Loading...", {
        clickToClose: false,
        svgColor: '#0284c7'
    });

    try {

        await loadAddress();
        // await getCities();

    } finally {
        Notiflix.Loading.remove();
    }

});

async function addNewAddress() {
    Notiflix.Loading.pulse("Wait...", {
        clickToClose: false,
        svgColor: '#0284c7'
    });

    let lineOne = document.getElementById("newAddressLine1").value.trim().replace(/\s+/g, " ");
    let lineTwo = document.getElementById("newAddressLine2").value.trim().replace(/\s+/g, " ");
    let city = document.getElementById("newCity").value;
    let pCode = document.getElementById("newPostalCode").value.trim();
    let mobile = document.getElementById("newMobile").value.trim();

    const addrObj = {
        lineOne: lineOne,
        lineTwo: lineTwo,
        cityId: Number(city),
        postalCode: pCode,
        mobile: mobile
    };

    try {
        const response = await fetch("api/profile/save-address", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(addrObj)
        });

        if (response.ok) {
            const data = await response.json();
            if (data.status) {
                Notiflix.Report.success(
                    'Openbay',
                    data.message,
                    'Okay',
                    function() {
                        document.getElementById("addressForm").reset();
                        document.getElementById("addressFormContainer").style.display = "none";
                        loadAddress();
                    }
                );
            } else {
                Notiflix.Notify.failure(data.message, { position: "center-top" });
            }
        } else {
            Notiflix.Notify.failure("Address details adding failed!", { position: "center-top" });
        }
    } catch (e) {
        Notiflix.Notify.failure(e.message, { position: "center-top" });
    } finally {
        Notiflix.Loading.remove();
    }
}

document.getElementById("cancelAddressBtn").addEventListener("click", function() {
    document.getElementById("addressForm").reset();
    document.getElementById("addressFormContainer").style.display = "none";
});

document.getElementById("closeAddressForm").addEventListener("click", function() {
    document.getElementById("addressForm").reset();
    document.getElementById("addressFormContainer").style.display = "none";
});

async function saveEditAddress(){

    Notiflix.Loading.pulse("Wait...", {
        clickToClose: false,
        svgColor: '#0284c7',
        zindex: 99999
    });

    let lineOne = document.getElementById("editAddressLine1");
    let lineTwo = document.getElementById("editAddressLine2");
    let city = document.getElementById("editCity");
    let pCode = document.getElementById("editPostalCode");
    let mobile = document.getElementById("editPhone");

    const addrObj ={
        addressId: editingAddressId,
        lineOne: lineOne.value,
        lineTwo: lineTwo.value,
        cityId: Number(city.value),
        postalCode: pCode.value,
        mobile: mobile.value
    }

    try{

        const response = await fetch("api/profile/update-address", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(addrObj)
        });
        if (response.ok) {
            const data = await response.json();
            if (data.status) {
                Notiflix.Report.success(
                    'Openbay',
                    data.message,
                    'Okay'
                );
                await loadAddress();
                closeEditModal();
            } else {
                Notiflix.Notify.failure(data.message, {
                    position: 'center-top',
                    zindex: 99999
                });
            }
        } else {
            Notiflix.Notify.failure("Address update failed!", {
                position: 'center-top',
                zindex: 99999
            });
        }

    }catch (e) {
        Notiflix.Notify.failure(e.message, {
            position: 'center-top',
            zindex: 99999
        });
    } finally {
        Notiflix.Loading.remove();
    }


}

function closeEditModal() {
    document.getElementById("editAddressModal").style.display = "none";
    document.body.style.overflow = "";
    editingAddressId = null;
    document.getElementById("editAddressForm").reset();
}

async function saveChanges(){

    Notiflix.Loading.pulse("Wait...", {
        clickToClose: false,
        svgColor: '#0284c7'
    });

    let firstName = document.getElementById("firstName");
    let lastName = document.getElementById("lastName");

    const userObj = {
        fname: firstName.value,
        lname: lastName.value
    };


    try {
        const response = await fetch("api/profile/update-profile", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userObj)
        });
        if (response.ok) {
            const data = await response.json();
            if (data.status) {
                Notiflix.Report.success(
                    'Openbay',
                    data.message,
                    'Okay'
                );
                await loadUserData();
            } else {
                Notiflix.Notify.failure(data.message, {
                    position: 'center-top'
                });
            }
        } else {
            Notiflix.Notify.failure("Profile update failed!", {
                position: 'center-top'
            });
        }
    } catch (e) {
        Notiflix.Notify.failure(e.message, {
            position: 'center-top'
        });
    } finally {
        Notiflix.Loading.remove(1000);
    }

}

async function loadAddress() {
    Notiflix.Loading.pulse("Wait...", {
        clickToClose: false,
        svgColor: '#0284c7'
    });

    try {
        const response = await fetch("api/profile/addresses");
        if(response.ok){
            const data = await response.json();
            console.log(data);

            // document.getElementById("addName").innerHTML=`Name: ${data.name}`;
            // document.getElementById("addEmail").innerHTML=`Email: ${data.email}`;
            renderAddress(data.addresses);
        }
    } catch (e) {
        Notiflix.Notify.failure(e.message, {
            position: 'center-top'
        });
    } finally {
        Notiflix.Loading.remove();
    }
}

function renderAddress(addresses) {
    const list = document.getElementById("addressList");
    const addNewCard = document.getElementById("addAddressCard");

    const dynamicCards = list.querySelectorAll('.address-card:not(.add-new)');
    dynamicCards.forEach(card => {
        if (card.id !== 'addAddressCard') {
            card.remove();
        }
    });

    if (!addresses || addresses.length === 0) {
        console.log("No addresses to display");
        return;
    }

    addresses.sort((a, b) => {
        return (b.isPrimary === true) - (a.isPrimary === true);
    });

    addresses.forEach(addr => {



        const addressId = addr.id || addr._id || addr.addressId || 'temp-' + Date.now();
        addressMap[addressId] = addr;

        console.log(addressId);

        const card = document.createElement("div");
        card.className = `address-card ${addr.isPrimary ? 'primary' : ''}`;
        card.innerHTML = `
            <div class="address-card-header">
                <div class="address-card-badge">
                    <i class="fas ${addr.isPrimary ? 'fa-star' : 'fa-location-dot'}"></i> 
                    ${addr.isPrimary ? 'Primary Address' : 'Secondary Address'}
                </div>
            </div>
            
            <div class="address-card-body">
                <div class="address-card-content">
                    <div class="address-location">
                        <div class="address-icon">
                            <i class="fas fa-home"></i>
                        </div>
                        <div class="address-text">
                            <h3 class="address-street">${escapeHtml(addr.lineOne || '')}</h3>
                            ${addr.lineTwo ? `<p class="address-street-secondary">${escapeHtml(addr.lineTwo)}</p>` : ''}
                            <p class="address-city">
                                <i class="fas fa-map-marker-alt"></i> ${escapeHtml(addr.cityName || '')}
                            </p>
                        </div>
                    </div>
                    
                    <div class="address-contact">
                        <div class="contact-item">
                            <div class="contact-icon">
                                <i class="fas fa-phone"></i>
                            </div>
                            <div class="contact-info">
                                <span class="contact-label">Phone</span>
                                <span class="contact-value">${escapeHtml(addr.mobile || '')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="address-card-footer">
                <div class="address-card-actions">
                    <button class="btn btn-outline btn-action edit-btn"  data-id="${addressId}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    
                    <button class="btn btn-danger btn-action delete-btn" data-id="${addressId}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                    
                    ${!addr.isPrimary ? `
                    <button class="btn btn-primary btn-action primary-btn" data-id="${addressId}">
                        <i class="fas fa-star"></i> Make Primary
                    </button>` : ''}
                </div>
            </div>
        `;

        if (addNewCard) {
            list.insertBefore(card, addNewCard);
        } else {
            list.appendChild(card);
        }

        attachAddressCardEvents(card, addressId, addr);
    });
}

function openEditModal(addressId) {

    const addr = addressMap[addressId];
    if (!addr) {
        Notiflix.Notify.failure("Address not found");
        return;
    }

    editingAddressId = addressId;


    const modal = document.getElementById('editAddressModal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // document.getElementById("editAddressId").value = addressId;
    document.getElementById("editAddressLine1").value = addr.lineOne || "";
    document.getElementById("editAddressLine2").value = addr.lineTwo || "";
    document.getElementById("editCity").value = addr.cityId || "";
    document.getElementById("editPhone").value = addr.mobile || "";
    document.getElementById("editPostalCode").value = addr.postalCode || "";
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function makePrimary(addressId) {

    Notiflix.Confirm.show(
        'Make Primary Address',
        'Do you want to set this address as your primary address?',
        'Yes, Make Primary',
        'No',
        async function okCb() {

            Notiflix.Loading.pulse("Updating...", {
                svgColor: '#0284c7'
            });

            try {
                const response = await fetch(`api/profile/make-primary-address/${addressId}`, {
                    method: "PUT"
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.status) {
                        Notiflix.Notify.success(data.message);
                        loadAddress();
                    } else {
                        Notiflix.Notify.failure(data.message);
                    }
                } else {
                    Notiflix.Notify.failure("Primary address update failed!");
                }

            } catch (e) {
                Notiflix.Notify.failure(e.message);
            } finally {
                Notiflix.Loading.remove();
            }
        },
        function cancelCb() {
        }
    );
}

function attachAddressCardEvents(card, addressId, addr) {

    const editBtn = card.querySelector(".edit-btn");
    editBtn.addEventListener("click", () => {
        openEditModal(addressId);
    });

    const deleteBtn = card.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", () => {
        deleteAddress(addressId);
    });

    const primaryBtn = card.querySelector(".primary-btn");
    if (primaryBtn) {
        primaryBtn.addEventListener("click", () => {
            makePrimary(addressId);
        });
    }
}

function deleteAddress(addressId) {

    Notiflix.Confirm.show(
        'Delete Address',
        'Are you sure you want to delete this address?',
        'Yes, Delete',
        'No',
        async function okCb() {
            Notiflix.Loading.pulse("Deleting...", {
                svgColor: '#ef4444'
            });

            try {
                const response = await fetch(`api/profile/delete-address/${addressId}`, {
                    method: "DELETE"
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.status) {
                        Notiflix.Notify.success(data.message);
                        loadAddress();
                    } else {
                        Notiflix.Notify.failure(data.message);
                    }
                } else {
                    Notiflix.Notify.failure("Address deleting failed!");
                }

            } catch (e) {
                Notiflix.Notify.failure(e.message);
            } finally {
                Notiflix.Loading.remove();
            }
        },
        function cancelCb() {
            Notiflix.Notify.info("Delete cancelled");
        }
    );
}

async function loadUserData() {
    try {
        const response = await fetch("api/profile/user-profile");
        if (response.ok) {
            if (response.redirected) {
                window.location.href = response.url;
                return;
            }
            const data = await response.json();
            console.log(data);


            // document.getElementById("username").innerHTML = `Hello, ${data.user.firstName} ${data.user.lastName}`;

            // let replacedText = String(data.user.sinceAt).replace("-", " ");
            // let since = replacedText.split(" ");
            // document.getElementById("since").innerHTML = `Smart Trade Member Since ${since[1]} ${since[0]}`;
            document.getElementById("firstName").value = data.user.fname;
            document.getElementById("lastName").value = data.user.lname;
            document.getElementById("primaryLineOne").value = data.user.lineOne || "";
            document.getElementById("primaryLineTwo").value = data.user.lineTwo ? data.user.lineTwo : "";
            document.getElementById("primaryPCode").value = data.user.postalCode ? data.user.postalCode : "";
            document.getElementById("PrimaryCity").value = data.user.cityId ? data.user.cityId : 0;
            document.getElementById("primaryMobile").value = data.user.mobile;
            // document.getElementById("currentPassword").value = data.user.password;

            // console.log("USER DATA:", data.user);

        } else {
            Notiflix.Notify.failure("Profile data loading failed!", {
                position: 'center-top'
            });
        }
    } catch (e) {
        Notiflix.Notify.failure(e.message, {
            position: 'center-top'
        });
    }
}

async function getCities() {
    console.log("category");
    try {
        const response = await fetch("api/data/cities");
        if (response.ok) {
            const data = await response.json();

            const primaryCity = document.getElementById("PrimaryCity");
            const editCity = document.getElementById("editCity");
            const newCity = document.getElementById("newCity");

            data.cities.forEach(city => {

                if (primaryCity) {
                    const opt1 = document.createElement("option");
                    opt1.value = city.id;
                    opt1.textContent = city.name;
                    primaryCity.appendChild(opt1);
                }

                if(newCity){
                    const opt3 = document.createElement("option");
                    opt3.value = city.id;
                    opt3.textContent = city.name;
                    newCity.appendChild(opt3);
                }

                if (editCity) {
                    const opt2 = document.createElement("option");
                    opt2.value = city.id;
                    opt2.textContent = city.name;
                    editCity.appendChild(opt2);
                }
            });

        } else {
            Notiflix.Notify.failure("City loading failed!");
        }
    } catch (e) {
        Notiflix.Notify.failure(e.message);
    }
}

// async function getCategory(){
//     try {
//         const response = await fetch("api/data/category");
//         if (response.ok) {
//             const data = await response.json();
//
//             const category1 = document.getElementById("productCategory");
//
//             data.Category.forEach(category => {
//
//                     const opt2 = document.createElement("option");
//                     opt2.value = category.id;
//                     opt2.textContent = category.name;
//                     category1.appendChild(opt2);
//
//             });
//
//         } else {
//             Notiflix.Notify.failure("Category loading failed!");
//         }
//     } catch (e) {
//         Notiflix.Notify.failure(e.message);
//     }
// }

async function changePassword() {

    Notiflix.Loading.pulse("Wait...", {
        clickToClose: false,
        svgColor: '#0284c7',
    });

    let currentPassword = document.getElementById("currentPassword");
    let newPassword = document.getElementById("newPassword");
    let confirmPassword = document.getElementById("confirmPassword");

    const obj = {
        password: currentPassword.value,
        newPassword: newPassword.value,
        confirmPassword: confirmPassword.value
    };

    try {
        const response = await fetch("api/profile/update-password", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(obj)
        });

        if (response.ok) {
            const data = await response.json();
            if (data.status) {
                Notiflix.Report.success('Openbay',
                    data.message + "<br>Please login again.",
                    'Okay',
                    function () {
                    window.location.href = "login.html";
                });

            } else {
                Notiflix.Notify.failure(data.message, {
                    position: 'center-top',
                });
            }
        } else {
            Notiflix.Notify.failure("Password update failed!", {
                position: 'center-top',
            });
        }

    } catch (e) {
        Notiflix.Notify.failure(e.message, {
            position: 'center-top',
        });
    } finally {
        Notiflix.Loading.remove();
    }





}
