//http://stackoverflow.com/a/506004
function redirect(url) {
    window.location.href = url;
}
var globalLoginRedirect = ''
function redirectToLoging() {
    redirect(globalLoginRedirect);
}

function handle401Error(message) {
    if (message.status === 401) {
        setTimeout(function () {
            redirectToLoging();
        }, 5000);
    }
}