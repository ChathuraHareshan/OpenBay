async function signUp(){

    Notiflix.Loading.pulse("Loading...", {
        clickToClose: false,
        svgColor: '#0284c7'
    });

    let fname = document.getElementById("fname");
    let lname = document.getElementById("lname");
    let email = document.getElementById("register-email");
    let password = document.getElementById("register-password");

    const user ={
        fname: fname.value,
        lname: lname.value,
        email: email.value,
        password: password.value
    }

    try{

        const response = await fetch("api/user/register",{
            method: "POST",
            headers: {
                "Content-Type":"application/json"
            },
            body:JSON.stringify(user)
        });

        Notiflix.Loading.pulse("wait...");

        if(response.ok){

            Notiflix.Loading.remove(1000)


            const data = await response.json();


            if(data.status){
                Notiflix.Report.success(
                    'OpenBay',
                    data.message,
                    'Confirmation Message',
                    () => {
                        window.location.href =
                            "beforeVerify.html?email=" + encodeURIComponent(email.value);
                    }
                );
            }else{
                Notiflix.Notify.failure(data.message);
            }

        }else{
            Notiflix.Notify.failure('Something went wrong. Please check your credentials');
        }

    }catch (e){
        Notiflix.Notify.failure(e.message);

    }finally {
        Notiflix.Loading.remove();
    }

}


const TIMER_DURATION = 60;
const STORAGE_KEY = "resend_timer_end";

const bigTimer = document.getElementById("bigTimer");
const resendBtn = document.getElementById("resendBtn");

let timerInterval;

function startBigTimer() {
    const endTime = Date.now() + TIMER_DURATION * 1000;
    localStorage.setItem(STORAGE_KEY, endTime);
    resendBtn.disabled = true;
    runTimer();
}

function runTimer() {
    clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        const endTime = localStorage.getItem(STORAGE_KEY);
        const remaining = Math.ceil((endTime - Date.now()) / 1000);

        if (remaining <= 0) {
            clearInterval(timerInterval);
            localStorage.removeItem(STORAGE_KEY);
            bigTimer.innerText = "Ready!";
            resendBtn.disabled = false;
        } else {
            bigTimer.innerText = remaining + "s";
        }
    }, 1000);
}

resendBtn.addEventListener("click", async () => {

    const params = new URLSearchParams(window.location.search);
    const email = params.get("email");

    if (!email) {
        Notiflix.Notify.failure("Email not found. Please register again.");
        return;
    }

    resendBtn.disabled = true;

    Notiflix.Loading.pulse("Sending verification email...", {
        clickToClose: false,
        svgColor: "#0284c7"
    });

    try {
        const res = await fetch("api/user/resend", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        const data = await res.json();

        Notiflix.Loading.remove();

        if (data.status) {
            Notiflix.Notify.success(data.message);
            startBigTimer();
        } else {
            Notiflix.Notify.failure(data.message);
            resendBtn.disabled = false;
        }

    } catch (err) {
        Notiflix.Loading.remove();
        Notiflix.Notify.failure("Server error");
        resendBtn.disabled = false;
    }
});


window.onload = () => {
    const endTime = localStorage.getItem(STORAGE_KEY);

    if (!endTime) {
        startBigTimer();
    } else if (Date.now() < endTime) {
        runTimer();
    } else {
        localStorage.removeItem(STORAGE_KEY);
        bigTimer.innerText = "Ready!";
        resendBtn.disabled = false;
    }
};
