// frontend/scripts/signup.js
// Full working auth helper: password toggle, basic validation, inline messages, demo redirect.
// Safe to include on signup.html and login.html (defer or place before </body>).

(function () {
  'use strict';

  // Create a show/hide toggle for a password input (no duplicates)
  function createToggleForInput(pwd) {
    if (!pwd || pwd.dataset.hasPwToggle === '1') return;
    pwd.dataset.hasPwToggle = '1';

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pw-toggle';
    btn.textContent = 'Show';
    btn.setAttribute('aria-label', 'Show password');

    // Minimal inline styles so toggle is visible even without CSS
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

    // Insert the toggle after the input (so it sits visually to the right)
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

  // Attach toggles to all password inputs
  function attachToggles() {
    document.querySelectorAll('input[type="password"]').forEach(function (pwd) {
      createToggleForInput(pwd);
    });
  }

  // Show inline messages if the form contains .auth-message.error or .auth-message.success
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

  // Validate required fields, email format, password length >= 8
  function validateForm(form) {
    var invalid = [];
    form.querySelectorAll('input[required]').forEach(function (input) {
      var val = (input.value || '').trim();
      if (!val) {
        invalid.push(input);
        return;
      }
      if (input.type === 'email' && !input.checkValidity()) {
        invalid.push(input);
        return;
      }
      if (input.type === 'password' && input.value.length < 8) {
        invalid.push(input);
        return;
      }
      // optional: username min length if name attribute is username
      if (input.name && input.name.toLowerCase().indexOf('user') !== -1 && input.value.length < 3) {
        invalid.push(input);
        return;
      }
    });
    return invalid;
  }

  // Attach submit handlers to forms with class .auth-form
  function attachFormHandlers() {
    document.querySelectorAll('form.auth-form').forEach(function (form) {
      // avoid double-binding
      if (form.dataset.authHandlerAttached === '1') return;
      form.dataset.authHandlerAttached = '1';

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        clearMessages(form);

        var invalid = validateForm(form);
        if (invalid.length) {
          invalid[0].focus();
          showMessage(form, 'error', 'Please fill the required fields correctly.');
          return;
        }

        // Simulate success: show message and redirect after a short delay
        showMessage(form, 'success', 'Success — redirecting...');
        setTimeout(function () {
          // Demo redirect — change as needed
          window.location.href = 'index.html';
        }, 900);
      });
    });
  }

  // Initialize and observe DOM mutations to handle dynamic content
  function start() {
    attachToggles();
    attachFormHandlers();

    var mo = new MutationObserver(function (mutations) {
      var needsAttach = false;
      for (var i = 0; i < mutations.length; i++) {
        if (mutations[i].addedNodes && mutations[i].addedNodes.length) {
          needsAttach = true;
          break;
        }
      }
      if (needsAttach) {
        attachToggles();
        attachFormHandlers();
      }
    });

    mo.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();