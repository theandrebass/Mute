function getMuteVideos() {
    return MuteUtils.nodeListToArray($$("video"));
}

function muteVideoElement(el) {
    el.volume = 0;
    el.muted = true;
    setTimeout(() => {
        el.volume = 0;
        el.muted = true;
    }, 500);
    setTimeout(() => {
        el.volume = 0;
        el.muted = true;
    }, 1000);
}

function stopVideoElement(el) {
    muteVideoElement(el);
    setTimeout(() => {
        el.pause();
        el.volume = 1;
    }, 500);
}

function settingsToActions(options) {
    if (options.willRun > -1) return;
    getMuteVideos().forEach(el => {
        switch (options.muteMode) {
            case 0:
                muteVideoElement(el);
                break;
            case 1:
                stopVideoElement(el);
                break;
        }
    });
}

function processDOM(request, sender, response) {
    let willRun;
    let muteMode;

    if (request !== undefined && sender !== undefined && response !== undefined) {
        willRun = request.exemptDomains instanceof Array && request.exemptDomains.indexOf(document.domain);
        muteMode = request.muteMode;

        settingsToActions({
            willRun: willRun,
            muteMode: muteMode
        });
    } else {
        chrome.storage.sync.get({
            muteMode: 0,
            exemptDomains: []
        }, record => {
            willRun = record.exemptDomains instanceof Array && record.exemptDomains.indexOf(document.domain);
            muteMode = record.muteMode;

            settingsToActions({
                willRun: willRun,
                muteMode: muteMode
            });
      });
    }

}

// wait for DOM to be parsed
document.addEventListener('DOMContentLoaded', processDOM);
window.addEventListener('load', () => {
    setTimeout(processDOM, 1000);
});

// await message from main thread of popup
chrome.runtime.onMessage.addListener(processDOM);
