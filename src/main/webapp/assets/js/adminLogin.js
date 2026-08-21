
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


        if (response.ok) {
            const data = await response.json();
            if (data.status) {
                Notiflix.Notify.success(data.message, {
                    position: 'center-top'
                });

                document.getElementById("enterCodeBtn").style.display = "block";

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



    document.getElementById("verificationCode").value = '';

    const modalElement = document.getElementById('verificationModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();


    modalElement.addEventListener('shown.bs.modal', function () {
        setTimeout(() => {
            const codeInput = document.getElementById("verificationCode");
            codeInput.focus();

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


        if (response.ok) {
            const data = await response.json();
            if (data.status) {
                Notiflix.Report.success(
                    'OpenBay',
                    data.message,
                    'Okay',
                    () => {
                        window.location = "adminIndex.html"
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