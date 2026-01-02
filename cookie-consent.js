(function() {
  var css = '.fs_checkbox-5_component{display:flex;align-items:center}.fs_checkbox-5_wrapper{position:relative;display:flex;align-items:center;cursor:pointer;padding-left:0;margin-bottom:0}.fs_checkbox-5_button{position:absolute;opacity:0;width:0;height:0;pointer-events:none}.fs_checkbox-5_mask{position:relative;width:3rem;height:1.75rem;border-radius:100px;background-color:var(--_color---neutral--light-gray);transition:background-color 200ms ease}.fs_checkbox-5_dot{position:absolute;top:50%;left:0.25rem;transform:translateY(-50%);width:1.25rem;height:1.25rem;border-radius:100%;background-color:var(--_color---neutral--mid-gray-muted);transition:transform 200ms ease,background-color 200ms ease;pointer-events:none;z-index:1}.fs_checkbox-5_button:checked~.fs_checkbox-5_mask{background-color:var(--_color---primary--mantis)}.fs_checkbox-5_button:checked~.fs_checkbox-5_dot{transform:translateY(-50%) translateX(1.25rem);background-color:white}.fs_checkbox-5_label{display:none}';
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var CONSENT_COOKIE_NAME = 'cookie_consent';
  var CONSENT_COOKIE_DAYS = 365;

  function getCookie(name) {
    var value = '; ' + document.cookie;
    var parts = value.split('; ' + name + '=');
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }

  function setCookie(name, value, days) {
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = name + '=' + value + ';expires=' + date.toUTCString() + ';path=/;SameSite=Lax';
  }

  function getConsentData() {
    var cookie = getCookie(CONSENT_COOKIE_NAME);
    if (!cookie) return null;
    try {
      return JSON.parse(decodeURIComponent(cookie));
    } catch (e) {
      return null;
    }
  }

  function setConsentData(data) {
    setCookie(CONSENT_COOKIE_NAME, encodeURIComponent(JSON.stringify(data)), CONSENT_COOKIE_DAYS);
  }

  function activateScript(script) {
    var newScript = document.createElement('script');
    for (var i = 0; i < script.attributes.length; i++) {
      var attr = script.attributes[i];
      if (attr.name !== 'type') {
        newScript.setAttribute(attr.name, attr.value);
      }
    }
    newScript.type = 'text/javascript';
    newScript.textContent = script.textContent;
    script.parentNode.replaceChild(newScript, script);
  }

  function activateScriptsByKey(key) {
    var scripts = document.querySelectorAll('script[type="text/plain"][data-cookie-key="' + key + '"]');
    for (var i = 0; i < scripts.length; i++) {
      activateScript(scripts[i]);
    }
  }

  function getToggleStates(form) {
    var toggles = form.querySelectorAll('[data-cookie-key]');
    var states = {};
    for (var i = 0; i < toggles.length; i++) {
      var toggle = toggles[i];
      var key = toggle.getAttribute('data-cookie-key');
      var checkbox = toggle.querySelector('input[type="checkbox"]');
      if (!checkbox && toggle.type === 'checkbox') {
        checkbox = toggle;
      }
      if (checkbox && key) {
        states[key] = checkbox.checked;
      }
    }
    return states;
  }

  function setAllToggles(form, checked) {
    var toggles = form.querySelectorAll('[data-cookie-key]');
    for (var i = 0; i < toggles.length; i++) {
      var toggle = toggles[i];
      var checkbox = toggle.querySelector('input[type="checkbox"]');
      if (!checkbox && toggle.type === 'checkbox') {
        checkbox = toggle;
      }
      if (checkbox) {
        checkbox.checked = checked;
      }
    }
  }

  function processConsent(states) {
    setConsentData(states);
    for (var key in states) {
      if (states.hasOwnProperty(key) && states[key]) {
        activateScriptsByKey(key);
      }
    }
  }

  function hideBanner(banner) {
    if (banner) {
      banner.style.display = 'none';
    }
  }

  function findBannerWrapper(form) {
    var element = form;
    while (element.parentElement) {
      element = element.parentElement;
      if (element.hasAttribute && element.hasAttribute('cookie-banner') && 
          element.getAttribute('cookie-banner') === 'wrapper') {
        return element;
      }
    }
    return null;
  }

  function init() {
    var forms = document.querySelectorAll('[cookie-banner="form"]');
    var existingConsent = getConsentData();

    if (existingConsent) {
      for (var key in existingConsent) {
        if (existingConsent.hasOwnProperty(key) && existingConsent[key]) {
          activateScriptsByKey(key);
        }
      }
      for (var i = 0; i < forms.length; i++) {
        var wrapper = findBannerWrapper(forms[i]);
        hideBanner(wrapper);
      }
      return;
    }

    for (var i = 0; i < forms.length; i++) {
      (function(form) {
        var wrapper = findBannerWrapper(form);
        var acceptAllBtn = form.querySelector('[cookie-banner="all-accept"]');
        var declineAllBtn = form.querySelector('[cookie-banner="all-decline"]');

        if (acceptAllBtn) {
          acceptAllBtn.addEventListener('click', function(e) {
            e.preventDefault();
            setAllToggles(form, true);
            var states = getToggleStates(form);
            processConsent(states);
            hideBanner(wrapper);
          });
        }

        if (declineAllBtn) {
          declineAllBtn.addEventListener('click', function(e) {
            e.preventDefault();
            setAllToggles(form, false);
            var states = getToggleStates(form);
            processConsent(states);
            hideBanner(wrapper);
          });
        }

        form.addEventListener('submit', function(e) {
          e.preventDefault();
          var states = getToggleStates(form);
          processConsent(states);
          hideBanner(wrapper);
        });
      })(forms[i]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
