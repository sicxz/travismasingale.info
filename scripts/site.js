// travismasingale.info — page behavior
// Theme toggle, JS-revealed email, contact form submit.

(function () {
  // ---------- theme toggle ----------
  var root = document.documentElement;
  var btn = document.getElementById('theme-toggle');
  var label = document.getElementById('theme-toggle-label');

  if (btn && label) {
    var stored = null;
    try { stored = localStorage.getItem('tm-theme'); } catch (e) {}
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(stored || (prefersDark ? 'dark' : 'light'));

    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem('tm-theme', next); } catch (e) {}
    });
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (label) label.textContent = theme === 'dark' ? 'Light' : 'Dark';
  }
})();

(function () {
  // ---------- email reveal ----------
  // Address is assembled at runtime so the raw HTML carries no scrapable string.
  var nodes = document.querySelectorAll('.js-email');
  for (var i = 0; i < nodes.length; i++) {
    var a = nodes[i];
    var u = a.getAttribute('data-user');
    var h = a.getAttribute('data-host');
    if (!u || !h) continue;
    var addr = u + '@' + h;
    var subject = a.getAttribute('data-subject') || '';
    a.setAttribute('href', 'mailto:' + addr + (subject ? '?subject=' + encodeURIComponent(subject) : ''));
    var handle = a.querySelector('.connect-handle');
    if (handle) handle.textContent = addr;
  }
})();

(function () {
  // ---------- contact form ----------
  var form = document.getElementById('contact-form');
  if (!form) return;
  var submit = document.getElementById('cf-submit');
  var status = document.getElementById('cf-status');
  var endpoint = form.getAttribute('action') || '';

  // Enable the submit only after JS runs — naive scrapers without JS can't fire it.
  submit.disabled = false;
  submit.textContent = 'Send message';

  // Time guard: fast-fire submits (< 2s after render) get rejected client-side.
  var renderedAt = Date.now();

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (Date.now() - renderedAt < 2000) {
      setStatus('error', 'Please take a moment before sending.');
      return;
    }

    if (!endpoint || endpoint.indexOf('YOUR_FORMSPREE_ID') !== -1) {
      setStatus('error', 'Form not configured yet. Email instead.');
      return;
    }

    submit.disabled = true;
    setStatus('sending', 'Sending…');

    var data = new FormData(form);

    fetch(endpoint, {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    })
      .then(function (res) {
        if (res.ok) {
          form.reset();
          setStatus('success', 'Message sent. Thanks.');
        } else {
          return res.json().then(function (json) {
            var err = (json && json.errors && json.errors.map(function (x) { return x.message; }).join(', ')) || 'Something went wrong.';
            setStatus('error', err);
          }).catch(function () {
            setStatus('error', 'Something went wrong. Try email instead.');
          });
        }
      })
      .catch(function () {
        setStatus('error', 'Network error. Try email instead.');
      })
      .then(function () {
        submit.disabled = false;
      });
  });

  function setStatus(state, text) {
    status.setAttribute('data-state', state);
    status.textContent = text;
  }
})();
