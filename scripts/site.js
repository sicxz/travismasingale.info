// travismasingale.info — site behavior.
// Email reveal + contact form. (Navigation is plain hyperlinks.)

(function () {
  // ---------- email reveal ----------
  var nodes = document.querySelectorAll('.js-email');
  for (var i = 0; i < nodes.length; i++) {
    var a = nodes[i];
    var u = a.getAttribute('data-user');
    var h = a.getAttribute('data-host');
    if (!u || !h) continue;
    var addr = u + '@' + h;
    var subject = a.getAttribute('data-subject') || '';
    a.setAttribute('href', 'mailto:' + addr + (subject ? '?subject=' + encodeURIComponent(subject) : ''));
    var handle = a.querySelector('.handle');
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

  submit.disabled = false;
  submit.textContent = 'Send message';

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
