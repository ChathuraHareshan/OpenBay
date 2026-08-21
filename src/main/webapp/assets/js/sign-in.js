async function SignIn(){

    Notiflix.Loading.pulse("Wait...",{
        clickToClose: false,
        svgColor: '#0284c7'
    });

    let email = document.getElementById("singin-email");
    let password = document.getElementById("singin-password");


    const userLoginObj = {
        email: email.value,
        password: password.value,

    }

    try{

        const response = await fetch("api/user/login",{
            method: "POST",
            headers: {
                "content-Type": "application/json"
            },
            body: JSON.stringify(userLoginObj)
        });

        if(response.ok){
            const data = await response.json();

            if(data.status){

                Notiflix.Report.success(
                    'OpenBay',
                    data.message,
                    'Okay',
                    () => {
                        window.location =  "index.html"
                    },
                );
            }else{
                Notiflix.Notify.failure(data.message,{
                    position : 'center-top'
                });
            }

        }else{
            Notiflix.Notify.failure("Login failed! Please try again")
        }

    }catch (e){
        Notiflix.Notify.failure(e.message,{
            position : 'center-top'
        });
    }finally {
        Notiflix.Loading.remove();
    }

}

