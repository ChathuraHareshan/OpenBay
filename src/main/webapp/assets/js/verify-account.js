let params = new URLSearchParams(window.location.search);

const verificationCode = document.getElementById("verificationCode");
verificationCode.value = params.get("verificationCode");
const userEmail = params.get("email");

async function verifyAccount(){

    Notiflix.Loading.pulse("Wait...", {
        clickToClose: false,
        svgCOLOR: '#0284c7'
    });


    const verifyObj ={
        email:userEmail,
        verificationCode:verificationCode.value
    }

    try {

        const response = await fetch("api/user/verify-account",{
            method: "POST",
            headers: {
                "Content-Type":"application/json"
            },
            body:JSON.stringify(verifyObj)
        });

        if(response.ok){
            const data = await response.json();
            if(data.status){
                Notiflix.Report.success(
                    'OpenBay',
                    data.message,
                    'Okay',
                    () => {
                        window.location = "login.html"
                    },
                );
            }else{
                Notiflix.Notify.failure(data.message);
            }
        }else{
            Notiflix.Notify.failure("Verification process failed");
        }

    }catch (e){
        Notiflix.Notify.failure(e.message);
    }finally {
        Notiflix.Loading.remove();
    }

}