window.addEventListener("load", async () => {
    try {
        Notiflix.Loading.pulse("Loading users...", {
            clickToClose: false,
            svgColor: '#0284c7'
        });
        await loadAllUsers();
    } finally {
        Notiflix.Loading.remove();
    }
});

async function loadAllUsers() {
    try {
        const response = await fetch(`api/user/all`);

        if (response.ok) {
            const data = await response.json();

            if (data.status) {
                console.log(data);
                renderUserTable(data.users);
            } else {
                Notiflix.Notify.failure(data.message, { position: 'center-top' });
            }
        } else {
            Notiflix.Notify.failure("Failed to load users!", { position: 'center-top' });
        }
    } catch (error) {
        Notiflix.Notify.failure("An error occurred while loading the users", { position: 'center-top' });
    }
}

function renderUserTable(users) {
    const tbody = document.getElementById("userTableBody");
    tbody.innerHTML = "";

    if (!users || users.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center">No users found.</td></tr>`;
        return;
    }

    users.forEach(user => {
        const isActive = user.status === "VERIFIED";

        const statusBadge = isActive
            ? `<div class="badge badge-success">Active</div>`
            : `<div class="badge badge-danger">Inactive</div>`;

        const formattedDate = user.sinceAt
            ? new Date(user.sinceAt).toLocaleString()
            : 'N/A';

        const row = `
            <tr>
                <td>
                    <ul class="list-unstyled order-list m-b-0">
                        <li class="team-member team-member-sm">
                            <img class="rounded-circle" src="assets/images/adminPanel/users/user-8.png" 
                                 alt="user" style="width:35px;height:35px;object-fit:cover;">
                        </li>
                    </ul>
                </td>
                <td>${user.fname} ${user.lname}</td>
                <td>${user.email}</td>
                <td>${formattedDate}</td>
                <td>${statusBadge}</td>
                <td>
                    <button class="btn btn-outline-primary btn-sm" onclick="openUserDetail(${user.id})">
                        <i class="fas fa-eye"></i> Detail
                    </button>
                    <button class="btn btn-outline-${isActive ? 'danger' : 'success'} btn-sm ml-1"
                            onclick="toggleUserStatus(${user.id}, '${isActive ? 'PENDING' : 'VERIFIED'}')">
                        <i class="fas fa-${isActive ? 'ban' : 'check'}"></i> ${isActive ? 'Deactivate' : 'Activate'}
                    </button>
                </td>
            </tr>`;
        tbody.insertAdjacentHTML("beforeend", row);
    });
}

async function openUserDetail(userId) {
    try {
        Notiflix.Loading.pulse("Loading...", { svgColor: '#0284c7' });
        const response = await fetch(`api/user/${userId}`);
        Notiflix.Loading.remove();

        if (response.ok) {
            const data = await response.json();
            if (data.status) {
                showUserModal(data.user, data.addresses);
            } else {
                Notiflix.Notify.failure(data.message, { position: 'center-top' });
            }
        } else {
            Notiflix.Notify.failure("Failed to load user details!", { position: 'center-top' });
        }
    } catch (error) {
        Notiflix.Loading.remove();
        Notiflix.Notify.failure("An error occurred.", { position: 'center-top' });
    }
}

function showUserModal(user, addresses) {

    const formattedDate = user.sinceAt
        ? new Date(user.sinceAt).toLocaleString()
        : 'N/A';

    const isActive = user.status === "VERIFIED";

    document.getElementById("modal-username").textContent = `${user.fname} ${user.lname}`;
    document.getElementById("modal-email").textContent = user.email;
    document.getElementById("modal-status").innerHTML = `
        ${isActive
        ? '<span class="badge badge-success">Active</span>'
        : '<span class="badge badge-danger">Inactive</span>'}
        <button class="btn btn-sm ${isActive ? 'btn-outline-danger' : 'btn-outline-success'} ml-2"
                onclick="toggleUserStatus(${user.id}, '${isActive ? 'PENDING' : 'VERIFIED'}')">
            ${isActive ? 'Deactivate' : 'Activate'}
        </button>
    `;
    document.getElementById("modal-since").textContent = formattedDate;

    const addrContainer = document.getElementById("modal-addresses");
    addrContainer.innerHTML = "";

    if (!addresses || addresses.length === 0) {
        addrContainer.innerHTML = `<p class="text-muted">No addresses found.</p>`;
    } else {
        addresses.forEach(addr => {
            const primaryBadge = addr.primary
                ? `<span class="badge badge-primary ml-2">Primary</span>`
                : "";
            addrContainer.insertAdjacentHTML("beforeend", `
                <div class="card mb-2 ${addr.primary ? 'border-primary' : ''}">
                    <div class="card-body py-2 px-3">
                        <div class="d-flex align-items-center mb-1">
                            <strong><i class="fas fa-map-marker-alt text-primary mr-1"></i> Address</strong>
                            ${primaryBadge}
                        </div>
                        <p class="mb-0">${addr.lineOne}${addr.lineTwo ? ', ' + addr.lineTwo : ''}</p>
                        <p class="mb-0">${addr.cityName || ''} ${addr.postalCode || ''}</p>
                        <p class="mb-0"><i class="fas fa-phone text-muted mr-1"></i>${addr.mobile || 'N/A'}</p>
                    </div>
                </div>`);
        });
    }

    $('#userDetailModal').modal('show');
}

function toggleUserStatus(userId, newStatus) {
    const actionLabel = newStatus === "VERIFIED" ? "activate" : "deactivate";

    Notiflix.Confirm.show(
        "Confirm Status Change",
        `Are you sure you want to ${actionLabel} this user account?`,
        "Yes",
        "Cancel",
        async function () {
            try {
                Notiflix.Loading.pulse("Updating status...", { svgColor: '#0284c7' });

                const response = await fetch(`api/user/${userId}/status`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: newStatus })
                });

                Notiflix.Loading.remove();

                if (response.ok) {
                    const data = await response.json();
                    if (data.status) {
                        Notiflix.Notify.success(data.message || "User status updated", { position: 'center-top' });
                        $('#userDetailModal').modal('hide');
                        await loadAllUsers();
                    } else {
                        Notiflix.Notify.failure(data.message, { position: 'center-top' });
                    }
                } else {
                    Notiflix.Notify.failure("Failed to update user status!", { position: 'center-top' });
                }
            } catch (error) {
                Notiflix.Loading.remove();
                Notiflix.Notify.failure("An error occurred while updating status.", { position: 'center-top' });
            }
        }
    );
}