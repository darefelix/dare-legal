"use strict";

(() => {
  const endpoint = "https://cstjkksgxyylpjgawqgo.supabase.co/auth/v1/verify";
  const apiKey = "sb_publishable_3ih9KsQYx0GjlKz0cAX_yg_F9DUj8IM";
  const confirm = document.getElementById("confirm");
  const openApp = document.getElementById("open-app");
  const fallback = document.getElementById("fallback");
  const show = (heading, message) => {
    document.getElementById("heading").textContent = heading;
    document.getElementById("message").textContent = message;
  };

  let token = null;
  try {
    const fragment = location.hash;
    if (fragment || location.search) history.replaceState(null, "", location.pathname);
    // Accept exactly one opaque signup hash. Never forward arbitrary URL parameters.
    if (!fragment.startsWith("#token_hash=")) throw new Error();
    const match = /^#token_hash=([A-Za-z0-9_-]{32,256})$/.exec(fragment);
    if (match) token = match[1];
  } catch {
    // Do not proceed if the credential cannot be removed from the URL.
  }

  const invalid = () => show(
    "This link can’t be used",
    "It may be incomplete, invalid, expired, or already used. If you already verified your email, open DARE Staging and sign in. Otherwise, open your latest confirmation email or contact support."
  );
  openApp.hidden = false;
  fallback.hidden = false;
  if (token === null) {
    invalid();
    return;
  }

  show("Verify your email", "Confirm your email address to finish setting up your DARE. Staging account.");
  confirm.hidden = false;
  openApp.hidden = true;
  fallback.hidden = true;
  confirm.addEventListener("click", async () => {
    if (token === null) return;
    const body = JSON.stringify({ token_hash: token, type: "email" });
    token = null;
    confirm.hidden = true;
    show("Verifying your email…", "Please wait while we confirm your address.");
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12_000);
    try {
      const response = await fetch(endpoint, {
        method: "POST", headers: { "Content-Type": "application/json", apikey: apiKey },
        body, signal: controller.signal, credentials: "omit", cache: "no-store",
        referrerPolicy: "no-referrer", redirect: "error"
      });
      // Supabase may return a session. Discard the body; never log, persist, or forward it.
      response.body?.cancel().catch(() => {});
      if (response.status === 200) {
        document.getElementById("checkmark").hidden = false;
        show("Email verified successfully", "You're ready to take the next step.");
      } else if ([400, 401, 403, 422].includes(response.status)) {
        invalid();
      } else {
        throw new Error();
      }
    } catch {
      show("We couldn’t confirm the result", "Check your connection and try signing in. If your address still isn’t confirmed, reopen the original email link or contact support.");
    } finally {
      clearTimeout(timer);
      openApp.hidden = false;
      fallback.hidden = false;
    }
  });
})();
