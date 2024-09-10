document.addEventListener("DOMContentLoaded", function() {
    const banner = document.getElementById('cookie-consent-banner');
    const acceptButton = document.getElementById('accept-cookies');
    const declineButton = document.getElementById('decline-cookies');

    if (!localStorage.getItem('cookieConsent')) {
        banner.style.display = 'block';
    }

    acceptButton.addEventListener('click', function() {
        localStorage.setItem('cookieConsent', 'accepted');
        banner.style.display = 'none';
        loadAds();
    });

    declineButton.addEventListener('click', function() {
        localStorage.setItem('cookieConsent', 'declined');
        banner.style.display = 'none';
    });

    if (localStorage.getItem('cookieConsent') === 'accepted') {
        loadAds();
    }
});

function loadAds() {
    if (localStorage.getItem('cookieConsent') === 'accepted') {
        console.log("Galetes acceptades")
        // const script = document.createElement('script');
        // script.src = 'URL_DEL_SCRIPT_DE_PUBLICIDAD'; //s'ha de substituir per l'enllaç a adsense
        // document.head.appendChild(script);
    }
}
