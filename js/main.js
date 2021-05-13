var Mute = {

    // muteMode 0 is just mute,
    // muteMode 1 is mute and stop
    muteMode: 0,
    exemptDomains: [],
    currentDomain: null,

    // elements
    el: {
        excludeOnButton: $(".excluder .on"),
        excludeOffButton: $(".excluder .off"),
        muteButton: $(".muter .mute"),
        stopButton: $(".muter .stop")
    },

    // events
    ev: {
        "click .excluder .on": "excludeSite",
        "click .excluder .off": "includeSite",
        "click .muter .mute": "setMute",
        "click .muter .stop": "setStop"
    },

    // functions
    f: {
        setDomainName: function(callback) {
            // get window domain name
            let url;
            chrome.tabs.query({
                "active": true,
                "lastFocusedWindow": true
            }, tabs => {
                url = tabs[0].url;

                let a = document.createElement('a');
                a.setAttribute('href', url);
                Mute.currentDomain = a.hostname;

                if (callback) callback();
            });
        },

        toast: function(message) {
           // pop up a toast
        },

        excludeSite: function(evt) {
            if (Mute.currentDomain && Mute.exemptDomains.indexOf(Mute.currentDomain) == -1) Mute.exemptDomains.push(Mute.currentDomain);

            this.setSettings();
            this.render();
        },

        includeSite: function(evt) {
            if (!Mute.currentDomain) return;

            var index = Mute.exemptDomains.indexOf(Mute.currentDomain);
            if (index > -1) Mute.exemptDomains.splice(index, 1);

            this.setSettings();
            this.render();
        },

        setMute: function(evt) {
            Mute.muteMode = 0;

            this.setSettings();
            this.render();
        },

        setStop: function(evt) {
            Mute.muteMode = 1;

            this.setSettings();
            this.render();
        },

        render: function() {
            switch (Mute.muteMode) {
                case 0:
                    Mute.el.stopButton.classList.remove("active");
                    Mute.el.muteButton.classList.add("active");
                    break;
                case 1:
                    Mute.el.muteButton.classList.remove("active");
                    Mute.el.stopButton.classList.add("active");
                    break;
            }

            if (Mute.currentDomain && Mute.exemptDomains.indexOf(Mute.currentDomain) > -1) {
                Mute.el.excludeOffButton.classList.remove("active");
                Mute.el.excludeOnButton.classList.add("active");
            } else {
                Mute.el.excludeOnButton.classList.remove("active");
                Mute.el.excludeOffButton.classList.add("active");
            }
        },

        getSettings: function(callback) {
            chrome.storage.sync.get({
                muteMode: 0,
                exemptDomains: []
            }, record => {
                Mute.muteMode = record.muteMode;
                Mute.exemptDomains = record.exemptDomains;

                if (callback) callback();
            });

            return {
                muteMode: Mute.muteMode,
                exemptDomains: Mute.exemptDomains
            };
        },

        setSettings: function(callback) {
          chrome.storage.sync.set({
              muteMode: Mute.muteMode,
              exemptDomains: Mute.exemptDomains
          }, function(){
              this.toast("Saved!")
          }.bind(this));

          if (callback) callback();

          // transferring communicable data about each site
          Mute.f.sendMessage();
        },

        sendMessage: function(message) {
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, tabs => {
                chrome.tabs.sendMessage(tabs[0].id, this.getSettings());
            });
        }
    }

};

Mute.init = function() {

    // add event listeners
    Object.keys(Mute.ev).forEach(function(identifier) {
        var eventName = identifier.split(" ")[0],
            selector = identifier.split(" ").splice(1).join(" "),
            fn = Mute.f[Mute.ev[identifier]].bind(Mute.f);

        MuteUtils.eventAdder(selector, eventName, fn);
    });

    // read and apply settings -- render is being weird
    Mute.f.getSettings(Mute.f.render.bind(Mute.f));
    setTimeout(Mute.f.render.bind(Mute.f), 10);

    Mute.f.setDomainName();

    console.info("Mute initialized");

};

Mute.init();
