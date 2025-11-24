// frontend/scripts/login.js
// Lightweight login helpers: password show/hide, simple validation, inline messages, demo redirect.

(function () {
  'use strict';

  function createToggleForInput(pwd) {
    if (!pwd || pwd.dataset.hasPwToggle === '1') return;
    pwd.dataset.hasPwToggle = '1';

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pw-toggle';
    btn.textContent = 'Show';
    btn.setAttribute('aria-label', 'Show password');

    // Minimal inline styles so it's visible even without CSS
    btn.style.background = 'transparent';
    btn.style.border = 'none';
    btn.style.cursor = 'pointer';
    btn.style.color = '#6b6b6b';
    btn.style.fontWeight = '700';
    btn.style.padding = '6px';
    btn.style.position = 'absolute';
    btn.style.right = '10px';
    btn.style.top = '50%';
    btn.style.transform = 'translateY(-50%)';

    var parent = pwd.parentNode;
    if (parent && getComputedStyle(parent).position === 'static') {
      parent.style.position = 'relative';
    }

    if (pwd.nextSibling) parent.insertBefore(btn, pwd.nextSibling);
    else parent.appendChild(btn);

    btn.addEventListener('click', function () {
      if (pwd.type === 'password') {
        pwd.type = 'text';
        btn.textContent = 'Hide';
        btn.setAttribute('aria-label', 'Hide password');
      } else {
        pwd.type = 'password';
        btn.textContent = 'Show';
        btn.setAttribute('aria-label', 'Show password');
      }
      pwd.focus();
    });
  }

  function attachToggles() {
    document.querySelectorAll('input[type="password"]').forEach(function (pwd) {
      createToggleForInput(pwd);
    });
  }

  function showMessage(form, type, text) {
    var el = form.querySelector('.auth-message.' + type);
    if (el) {
      el.textContent = text;
      el.style.display = 'block';
    } else {
      if (type === 'error') alert(text);
      else console.log(text);
    }
  }

  function clearMessages(form) {
    form.querySelectorAll('.auth-message').forEach(function (m) {
      m.style.display = 'none';
      m.textContent = '';
    });
  }

  function validateLoginForm(form) {
    var invalid = [];
    // email
    var email = form.querySelector('input[type="email"]');
    if (!email || !(email.value || '').trim() || !email.checkValidity()) invalid.push(email || null);
    // password
    var pwd = form.querySelector('input[type="password"]');
    if (!pwd || !(pwd.value || '').trim() || (pwd.value && pwd.value.length < 8)) invalid.push(pwd || null);

    // remove any nulls (in case inputs missing)
    return invalid.filter(Boolean);
  }

  function attachFormHandler() {
    document.querySelectorAll('form.auth-form').forEach(function (form) {
      if (form.dataset.loginHandlerAttached === '1') return;
      form.dataset.loginHandlerAttached = '1';

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        clearMessages(form);

        var invalid = validateLoginForm(form);
        if (invalid.length) {
          invalid[0].focus();
          showMessage(form, 'error', 'Please enter a valid email and a password (minimum 8 characters).');
          return;
        }

        // Demo success: show message then redirect
        showMessage(form, 'success', 'Login successful — redirecting...');
        setTimeout(function () {
          window.location.href = 'index.html';
        }, 800);
      });
    });
  }

  function start() {
    attachToggles();
    attachFormHandler();

    // watch for dynamically injected forms/inputs
    var mo = new MutationObserver(function (mutations) {
      var added = false;
      for (var i = 0; i < mutations.length; i++) {
        if (mutations[i].addedNodes && mutations[i].addedNodes.length) {
          added = true;
          break;
        }
      }
      if (added) {
        attachToggles();
        attachFormHandler();
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();