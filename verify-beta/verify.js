"use strict";

(() => {
  // Supabase verifies the email before this page. This page never authenticates,
  // exchanges a code, or treats URL content as proof of account confirmation.
  let state = "missing";
  try {
    const search = location.search;
    const hash = location.hash;
    // Run before styles/DOM load. No code/token is retained in history or links.
    if (search || hash) history.replaceState(null, "", location.pathname);
    const query = new URLSearchParams(search);
    const fragment = new URLSearchParams(hash.slice(1));
    const hasError = (params) => ["error", "error_code", "error_description"].some((key) => params.has(key));
    if (hasError(query) || hasError(fragment)) {
      state = "error";
    } else if (hash || query.size > 0) {
      // Unknown parameters, legacy tokens, fragments and duplicates are not accepted.
      // redirect/next/return_to can never choose a destination.
      const codes = query.getAll("code");
      const validCode = codes.length === 1 && codes[0].length >= 16 && codes[0].length <= 256
        && !/[^A-Za-z0-9_-]/.test(codes[0]);
      state = !hash && query.size === 1 && validCode
        ? "continue" : "invalid";
    }
  } catch {
    // If address-bar cleanup fails, do not offer an in-page app handoff.
    state = "cleanup-failed";
  }

  const render = () => {
    const heading = document.getElementById("heading");
    const message = document.getElementById("message");
    const openApp = document.getElementById("open-app");
    // Fixed destination: never append URL input, codes, tokens, or a session.
    openApp.setAttribute("href", "dare://home");
    if (state === "continue") {
      heading.textContent = "Continue in DARE.";
      message.textContent = "Return to DARE. and sign in with your email and password. The app will check your account.";
    } else if (state === "error" || state === "invalid") {
      heading.textContent = "This link can’t be used";
      message.textContent = "It may be invalid, expired, or already used. If you already confirmed your email, sign in. Otherwise, use your latest confirmation email or contact support.";
    } else if (state === "cleanup-failed") {
      heading.textContent = "Open DARE. manually";
      message.textContent = "Close this tab and sign in from the app. Do not copy or share the confirmation link.";
      openApp.hidden = true;
    }
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render, { once: true });
  else render();
})();
