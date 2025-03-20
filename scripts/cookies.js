document.addEventListener("DOMContentLoaded", function() {
    const banner = document.getElementById('cookie-consent-banner');
    const acceptButton = document.getElementById('accept-cookies');
    const declineButton = document.getElementById('decline-cookies');

    const cookieConsent = localStorage.getItem('cookieConsent');

    if (cookieConsent === null) {
        banner.style.display = 'block';
    } else {
        banner.style.display = 'none';
    }

    acceptButton.addEventListener('click', function() {
        localStorage.setItem('cookieConsent', 'accepted');
        banner.style.display = 'none';
    });

    declineButton.addEventListener('click', function() {
        localStorage.setItem('cookieConsent', 'declined');
        banner.style.display = 'none';
    });

    loadAds();
});

function loadAds() {
    console.log("loadAds test");
    // const script = document.createElement('script');
    // script.src = 'URL_DEL_SCRIPT_DE_PUBLICIDAD'; // Reemplaza con el enlace correcto
    // document.head.appendChild(script);
}