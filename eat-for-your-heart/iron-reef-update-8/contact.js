/* Iron Reef LLC: pop-up contact form.
   Any button that links to "mailto:info@ironreefllc.com" opens this form instead.
   Messages are delivered by Web3Forms (web3forms.com) to the email on that account.
   To change where messages go, log in at app.web3forms.com and edit the form's email. */
(() => {
  const ACCESS_KEY = "dc035d55-85e3-4902-ba96-a5f5f542063c";
  const TOPICS = ["Rodeo consulting", "Dive consulting", "Rodeo school for my association", "Something else"];

  const css = `
  .cf-dialog{margin:auto;border:none;border-radius:8px;padding:0;width:min(560px,calc(100% - 32px));max-height:calc(100dvh - 32px);background:var(--cream);color:var(--ink);box-shadow:0 24px 60px rgba(1,46,77,.35)}
  .cf-dialog::backdrop{background:rgba(1,26,45,.6)}
  .cf-head{background:var(--navy);color:var(--cream);padding:22px 28px;display:flex;align-items:flex-start;justify-content:space-between;gap:16px}
  .cf-head .eyebrow{color:var(--tan-light)}
  .cf-head h2{font-family:var(--display);font-size:1.5rem;letter-spacing:.02em;line-height:1.15;margin-top:4px}
  .cf-x{background:none;border:none;color:var(--cream);font-size:1.8rem;line-height:1;cursor:pointer;padding:0 4px}
  .cf-body{padding:24px 28px 28px}
  .cf-form{display:grid;gap:14px}
  .cf-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  @media (max-width:520px){.cf-row{grid-template-columns:1fr}.cf-head,.cf-body{padding-inline:20px}}
  .cf-form label{display:grid;gap:5px;font-family:var(--ui);font-weight:600;font-size:.78rem;letter-spacing:.08em;text-transform:uppercase;color:var(--navy)}
  .cf-form label small{font-weight:500;text-transform:none;letter-spacing:0;color:var(--muted)}
  .cf-form input,.cf-form select,.cf-form textarea{font:inherit;font-family:var(--body);font-size:1rem;text-transform:none;letter-spacing:0;color:var(--ink);background:#fff;border:1px solid var(--tan-light);border-radius:4px;padding:10px 12px;width:100%}
  .cf-form textarea{min-height:130px;resize:vertical}
  .cf-form input:focus,.cf-form select:focus,.cf-form textarea:focus{outline:2px solid var(--sea);outline-offset:1px;border-color:var(--sea)}
  .cf-form .btn{justify-self:start;cursor:pointer}
  .cf-form .btn[disabled]{opacity:.6;cursor:wait}
  .cf-hp{position:absolute;left:-9999px}
  .cf-form[hidden],.cf-done[hidden]{display:none}
  .cf-msg{font-family:var(--ui);font-size:.92rem}
  .cf-msg.err{color:#a3312a}
  .cf-done{text-align:center;padding:12px 0}
  .cf-done h3{font-family:var(--display);color:var(--navy);font-size:1.4rem;margin-bottom:8px}
  .cf-done p{color:var(--muted);margin-bottom:20px}
  .cf-alt{margin-top:14px;font-family:var(--ui);font-size:.85rem;color:var(--muted)}
  `;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  const dlg = document.createElement("dialog");
  dlg.className = "cf-dialog";
  dlg.setAttribute("aria-labelledby", "cf-title");
  dlg.innerHTML = `
    <div class="cf-head">
      <div><div class="eyebrow">Iron Reef LLC</div><h2 id="cf-title">Book a consultation</h2></div>
      <button class="cf-x" type="button" aria-label="Close">&times;</button>
    </div>
    <div class="cf-body">
      <form class="cf-form" novalidate>
        <div class="cf-row">
          <label>Name<input name="name" autocomplete="name" required></label>
          <label>Email<input name="email" type="email" autocomplete="email" required></label>
        </div>
        <div class="cf-row">
          <label>Phone <small>(optional)</small><input name="phone" type="tel" autocomplete="tel"></label>
          <label>Topic<select name="topic">${TOPICS.map(t => `<option>${t}</option>`).join("")}</select></label>
        </div>
        <label>Message<textarea name="message" required placeholder="What you're looking for, your experience level, and any dates you have in mind."></textarea></label>
        <input class="cf-hp" type="checkbox" name="botcheck" tabindex="-1" autocomplete="off" aria-hidden="true">
        <p class="cf-msg" aria-live="polite"></p>
        <button class="btn solid" type="submit">Send message</button>
      </form>
      <div class="cf-done" hidden>
        <h3>Thanks for reaching out</h3>
        <p>Your message is on its way. I'll get back to you soon.</p>
        <button class="btn line cf-close" type="button">Close</button>
      </div>
      <p class="cf-alt">Prefer email? Write to <a href="mailto:info@ironreefllc.com">info@ironreefllc.com</a>.</p>
    </div>`;
  document.body.appendChild(dlg);

  const form = dlg.querySelector("form"), done = dlg.querySelector(".cf-done"),
        msg = dlg.querySelector(".cf-msg"), send = form.querySelector("button[type=submit]");

  function open(topic){
    form.hidden = false; done.hidden = true; msg.textContent = ""; msg.className = "cf-msg";
    if (topic) form.topic.value = topic;
    dlg.showModal();
    setTimeout(() => form.name.focus(), 50);
  }
  const close = () => dlg.close();
  dlg.querySelector(".cf-x").addEventListener("click", close);
  dlg.querySelector(".cf-close").addEventListener("click", close);
  dlg.addEventListener("click", e => { if (e.target === dlg) close(); });

  // Buttons that link to the email address open the form instead
  document.querySelectorAll('a.btn[href^="mailto:info@ironreefllc.com"]').forEach(a => {
    const subj = decodeURIComponent((a.href.split("subject=")[1] || "")).toLowerCase();
    const topic = subj.includes("dive") ? "Dive consulting" : subj.includes("rodeo") ? "Rodeo consulting" : "";
    a.addEventListener("click", e => { e.preventDefault(); open(topic); });
  });

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const f = form;
    if (!f.name.value.trim() || !f.email.value.trim() || !f.message.value.trim()) {
      msg.textContent = "Please fill in your name, email and message."; msg.className = "cf-msg err"; return;
    }
    if (!f.email.checkValidity()) { msg.textContent = "That email address doesn't look right."; msg.className = "cf-msg err"; return; }
    send.disabled = true; send.textContent = "Sending…"; msg.textContent = ""; msg.className = "cf-msg";
    const data = {
      access_key: ACCESS_KEY,
      subject: `Iron Reef website: ${f.topic.value} from ${f.name.value.trim()}`,
      from_name: "Iron Reef website",
      name: f.name.value.trim(), email: f.email.value.trim(), phone: f.phone.value.trim(),
      topic: f.topic.value, message: f.message.value.trim(),
      page: location.pathname, botcheck: f.botcheck.checked
    };
    try {
      const r = await fetch("https://api.web3forms.com/submit", {
        method: "POST", headers: {"Content-Type": "application/json", Accept: "application/json"}, body: JSON.stringify(data)
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.success) throw new Error(j.message || "failed");
      f.reset(); form.hidden = true; done.hidden = false;
    } catch (err) {
      msg.innerHTML = 'Sorry, that didn\'t go through. Please try again, or email <a href="mailto:info@ironreefllc.com">info@ironreefllc.com</a>.';
      msg.className = "cf-msg err";
    } finally {
      send.disabled = false; send.textContent = "Send message";
    }
  });
})();
