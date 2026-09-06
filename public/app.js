document.querySelectorAll('.user').forEach(userMenu => {
    const toggle = userMenu.querySelector('.user__toggle');

    toggle.addEventListener('click', (e) => {
        e.stopPropagation(); // don't let this click bubble to the document listener below
        console.log("clicked");

        userMenu.classList.toggle('is-open');
    });
});

// clicking anywhere else closes any open menu
document.addEventListener('click', () => {
    document.querySelectorAll('.user.is-open').forEach(el => el.classList.remove('is-open'));
});

const getPostion = () => {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
    })
}
async function getCity() {



    try {

        const position = await getPostion();

        const { latitude, longitude } = position.coords;
        const res = await fetch(`/api/geocode?lat=${latitude}&lon=${longitude}`);
        const data = await res.json();

        if (city != data.city) {

            location.reload()
        }
    } catch (error) {
        console.log("Geolocation failed, using default:", error.message);

        const res = await fetch(`/api/geocode?defaultCity=Bangkok`);
        const data = await res.json();

        if (city != data.city) {

            location.reload()
        }
    }
}

getCity()
