"use strict";

(() => {
  const show = (heading, message) => {
    document.getElementById("heading").textContent = heading;
    document.getElementById("message").textContent = message;
  };

  let query, fragment;
  try {
    query = new URLSearchParams(location.search);
    fragment = new URLSearchParams(location.hash.slice(1));
    if (location.search || location.hash) history.replaceState(null, "", location.pathname);
  } catch {
    show("Continue in DARE.", "Open DARE Staging and sign in to check your account.");
    return;
  }

  const hasError = (params) => ["error", "error_code", "error_description"].some((key) => params.has(key));
  if (hasError(query) || hasError(fragment)) {
    show("This link can’t be used", "It may be expired, invalid, or already used. If you already verified your email, sign in. Otherwise, use the latest confirmation email or contact support.");
    return;
  }

  // A PKCE code is a browser navigation hint, never proof of account ownership.
  // Do not redeem it, forward it, or use it to establish a session.
  const codes = query.getAll("code");
  if (fragment.size === 0 && codes.length === 1 && /^[A-Za-z0-9_-]{16,256}$/.test(codes[0])) {
    document.getElementById("checkmark").hidden = false;
    show("Continue in DARE.", "You're ready to take the next step. Open DARE Staging and sign in to finish.");
  }
})();
