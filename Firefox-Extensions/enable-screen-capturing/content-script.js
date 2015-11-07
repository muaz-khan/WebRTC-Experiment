// window.postMessage({ enableScreenCapturing: true, domains: ["www.firefox.com"] }, "*");

window.addEventListener("message", function(event) {
    var addonMessage = event.data;

    if(addonMessage && addonMessage.enableScreenCapturing && addonMessage.domains && addonMessage.domains.length) {
        var confirmMessage = 'Current webpage requested to enable WebRTC Screen Capturing for following domains:\n';
        confirmMessage += JSON.stringify(addonMessage.domains, null, '\t') + '\n\n';
        confirmMessage += 'Please confirm to enable "permanent" screen capturing for above domains.';

        if(window.confirm(confirmMessage)) {
            self.port.emit('installation-confirmed', addonMessage.domains);

            // tell webpage that user confirmed screen capturing & its enabled for his domains.
            window.postMessage({
                enabledScreenCapturing: true,
                domains: addonMessage.domains
            }, '*');
        }
        else {
            // tell webpage that user denied/rejected screen capturing for his domains.
            window.postMessage({
                enabledScreenCapturing: false,
                domains: addonMessage.domains,
                reason: 'user-rejected'
            }, '*');
        }
    }
}, false);
