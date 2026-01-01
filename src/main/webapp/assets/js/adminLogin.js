async function sendVCode() {
    Notiflix.Loading.pulse("Wait...", {
        clickToClose: false,
        svgColor: '#0284c7'
    });


    let email = document.getElementById("email");

    const admin = {
        email: email.value,
    }
    try {
        const response = await fetch("api/admin", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(admin)
        });


        if (response.ok) { // 200
            const data = await response.json();
            if (data.status) {
                Notiflix.Notify.success(data.message, {
                    position: 'center-top'
                });

                document.getElementById("enterCodeBtn").style.display = "block";


                // document.querySelector('button[onclick="sendVCode();"]').disabled = true;

                // Open verification modal after a short delay
                setTimeout(() => {
                    openVerificationModal();
                }, 1000);

            } else {
                Notiflix.Notify.failure(data.message,{
                    position:'center-top'
                });
            }
        } else {
            Notiflix.Notify.failure('Something went wrong. Please check your credentials',{
                position:'center-top'
            });
        }
    } catch (e) {
        Notiflix.Notify.failure(e.message,{
            position:'topRight'
        });
    }finally {
        Notiflix.Loading.remove(1000);
    }
}

function openVerificationModal() {


    // Display email in modal
    // document.getElementById("emailDisplay").textContent = currentAdminEmail;

    // Clear previous code
    document.getElementById("verificationCode").value = '';

    // Show modal
    const modalElement = document.getElementById('verificationModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();

    // Focus on verification input after modal is shown
    modalElement.addEventListener('shown.bs.modal', function () {
        setTimeout(() => {
            const codeInput = document.getElementById("verificationCode");
            codeInput.focus();

            // Auto-tab functionality
            codeInput.addEventListener('input', function(e) {
                if (this.value.length === 6) {
                    verifyCode();
                }
            });
        }, 300);
    }, { once: true });
}

async function verifyCode(){

    Notiflix.Loading.pulse("Wait...", {
        clickToClose: false,
        svgColor: '#0284c7'
    });


    let email = document.getElementById("email");
    let vcode = document.getElementById("verificationCode");

    const admin = {
        email: email.value,
        verificationCode: vcode.value
    }

    try {
        const response = await fetch("api/admin/verify", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(admin)
        });


        if (response.ok) { // 200
            const data = await response.json();
            if (data.status) {
                Notiflix.Report.success(
                    'OpenBay',
                    data.message,
                    'Okay', // button title
                    () => {
                        window.location = "adminPanel.html"
                    },
                );

            } else {
                Notiflix.Notify.failure(data.message,{
                    position:'center-top'
                });
            }
        } else {
            Notiflix.Notify.failure('Something went wrong. Please check your credentials',{
                position:'center-top'
            });
        }
    } catch (e) {
        Notiflix.Notify.failure(e.message,{
            position:'center-top'
        });
    }finally {
        Notiflix.Loading.remove(1000);
    }

}