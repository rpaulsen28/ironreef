/* Iron Reef LLC: pop-up forms.
   Two forms share this file:
   - "Book a consultation": opened by any button that links to mailto:info@ironreefllc.com
     (the Ask about... and Email Iron Reef buttons).
   - "Contact Iron Reef": opened by any link to /?contact (the Contact menu and footer links),
     for general questions that aren't consultation requests.
   Messages are delivered by Web3Forms (web3forms.com) to the email on that account.
   To change where messages go, log in at app.web3forms.com and edit the form's email.
   To change the choices in a drop-down, edit the lists just below. */
(() => {
  const ACCESS_KEY = "dc035d55-85e3-4902-ba96-a5f5f542063c";

  const SERVICES = ["Rodeo consulting", "Dive consulting", "Rodeo school for my association"];
  const EXPERIENCE = ["Brand new", "Some experience", "Experienced competitor or diver", "Instructor or organizer"];
  const CONTACT_TOPICS = ["General question", "Store or order", "Eat for your Heart", "Sponsorship or media", "Something else"];

  const opts = list => list.map(t => `<option>${t}</option>`).join("");

  const MODES = {
    book: {
      eyebrow: "Iron Reef consulting",
      title: "Book a consultation",
      intro: "Tell me what you're after and I'll follow up to set a time.",
      send: "Request consultation",
      doneTitle: "Request received",
      doneText: "Thanks! I'll be in touch soon to talk details and set a time.",
      subject: f => `Consultation request: ${f.service.value} from ${f.name.value.trim()}`,
      fields: `
        <div class="cf-row">
          <label>Name<input name="name" autocomplete="name" required></label>
          <label>Email<input name="email" type="email" autocomplete="email" required></label>
        </div>
        <div class="cf-row">
          <label>Phone <small>(optional)</small><input name="phone" type="tel" autocomplete="tel"></label>
          <label>Service<select name="service">${opts(SERVICES)}</select></label>
        </div>
        <div class="cf-row">
          <label>Experience level<select name="experience">${opts(EXPERIENCE)}</select></label>
          <label>Preferred dates <small>(optional)</small><input name="dates" placeholder="e.g. weekends in March"></label>
        </div>
        <label>What are you looking for?<textarea name="message" required placeholder="Events you want to work on, dive plans, group size, location…"></textarea></label>`,
      data: f => ({ service: f.service.value, experience: f.experience.value, preferred_dates: f.dates.value.trim(), phone: f.phone.value.trim() })
    },
    contact: {
      eyebrow: "Iron Reef LLC",
      title: "Contact Iron Reef",
      intro: "Questions about the store, recipes, sponsorships or anything else.",
      send: "Send message",
      doneTitle: "Thanks for reaching out",
      doneText: "Your message is on its way. I'll get back to you soon.",
      subject: f => `Website message: ${f.topic.value} from ${f.name.value.trim()}`,
      fields: `
        <div class="cf-row">
          <label>Name<input name="name" autocomplete="name" required></label>
          <label>Email<input name="email" type="email" autocomplete="email" required></label>
        </div>
        <label>Topic<select name="topic">${opts(CONTACT_TOPICS)}</select></label>
        <label>Message<textarea name="message" required></textarea></label>`,
      data: f => ({ topic: f.topic.value })
    }
  };

  const css = `
  .cf-dialog{margin:auto;border:none;border-radius:8px;padding:0;width:min(580px,calc(100% - 32px));max-height:calc(100dvh - 32px);background:var(--cream);color:var(--ink);box-shadow:0 24px 60px rgba(1,46,77,.35)}
  .cf-dialog::backdrop{background:rgba(1,26,45,.6)}
  .cf-head{background:var(--navy);color:var(--cream);padding:22px 28px;display:flex;align-items:flex-start;justify-content:space-between;gap:16px}
  .cf-dialog.cf-contact .cf-head{background:var(--tan-dark)}
  .cf-head .eyebrow{color:var(--tan-light)}
  .cf-dialog.cf-contact .cf-head .eyebrow{color:#fff}
  .cf-head h2{font-family:var(--display);font-size:1.5rem;letter-spacing:.02em;line-height:1.15;margin-top:4px}
  .cf-head p{font-size:.95rem;margin-top:6px}
  .cf-x{background:none;border:none;color:var(--cream);font-size:1.8rem;line-height:1;cursor:pointer;padding:0 4px}
  .cf-body{padding:24px 28px 28px}
  .cf-form{display:grid;gap:14px}
  .cf-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  @media (max-width:520px){.cf-row{grid-template-columns:1fr}.cf-head,.cf-body{padding-inline:20px}}
  .cf-form label{display:grid;gap:5px;align-content:start;font-family:var(--ui);font-weight:600;font-size:.78rem;letter-spacing:.08em;text-transform:uppercase;color:var(--navy)}
  .cf-form label small{font-weight:500;text-transform:none;letter-spacing:0;color:var(--muted)}
  .cf-form input,.cf-form select,.cf-form textarea{font-family:var(--body);font-size:1rem;font-weight:400;text-transform:none;letter-spacing:0;color:var(--ink);background:#fff;border:1px solid var(--tan-light);border-radius:4px;padding:10px 12px;width:100%}
  .cf-form textarea{min-height:120px;resize:vertical}
  .cf-form input:focus,.cf-form select:focus,.cf-form textarea:focus{outline:2px solid var(--sea);outline-offset:1px;border-color:var(--sea)}
  .cf-form .btn{justify-self:start;cursor:pointer}
  .cf-form .btn[disabled]{opacity:.6;cursor:wait}
  .cf-hp{position:absolute;left:-9999px}
  .cf-form[hidden],.cf-done[hidden]{display:none}
  .cf-msg{font-family:var(--ui);font-size:.92rem}
  .cf-msg:empty{display:none}
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
  document.body.appendChild(dlg);

  let mode = null;

  function build(m){
    mode = m;
    const M = MODES[m];
    dlg.className = "cf-dialog cf-" + m;
    dlg.innerHTML = `
      <div class="cf-head">
        <div><div class="eyebrow">${M.eyebrow}</div><h2 id="cf-title">${M.title}</h2><p>${M.intro}</p></div>
        <button class="cf-x" type="button" aria-label="Close">&times;</button>
      </div>
      <div class="cf-body">
        <form class="cf-form" novalidate>
          ${M.fields}
          <input class="cf-hp" type="checkbox" name="botcheck" tabindex="-1" autocomplete="off" aria-hidden="true">
          <p class="cf-msg" aria-live="polite"></p>
          <button class="btn solid" type="submit">${M.send}</button>
        </form>
        <div class="cf-done" hidden>
          <h3>${M.doneTitle}</h3>
          <p>${M.doneText}</p>
          <button class="btn line cf-close" type="button">Close</button>
        </div>
        <p class="cf-alt">Prefer email? Write to <a href="mailto:info@ironreefllc.com">info@ironreefllc.com</a>.</p>
      </div>`;
    dlg.querySelector(".cf-x").addEventListener("click", () => dlg.close());
    dlg.querySelector(".cf-close").addEventListener("click", () => dlg.close());
    dlg.querySelector("form").addEventListener("submit", submit);
  }

  function open(m, service){
    if (dlg.open) dlg.close();
    build(m);
    const f = dlg.querySelector("form");
    if (service && f.service) f.service.value = service;
    dlg.showModal();
    setTimeout(() => f.name.focus(), 50);
  }
  dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });

  // Consultation buttons (links to the email address)
  document.querySelectorAll('a.btn[href^="mailto:info@ironreefllc.com"]').forEach(a => {
    const subj = decodeURIComponent(a.href.split("subject=")[1] || "").toLowerCase();
    const service = subj.includes("dive") ? "Dive consulting" : subj.includes("rodeo") ? "Rodeo consulting" : "";
    a.addEventListener("click", e => { e.preventDefault(); open("book", service); });
  });

  // General contact links (/?contact)
  document.querySelectorAll('a[href$="?contact"]').forEach(a => {
    a.addEventListener("click", e => { e.preventDefault(); open("contact"); });
  });
  // Arriving from another page's Contact link (for example the recipe pages)
  if (new URLSearchParams(location.search).has("contact")) {
    history.replaceState(null, "", location.pathname + location.hash);
    open("contact");
  }

  async function submit(e){
    e.preventDefault();
    const f = e.target, M = MODES[mode];
    const msg = f.querySelector(".cf-msg"), send = f.querySelector("button[type=submit]");
    const err = t => { msg.innerHTML = t; msg.className = "cf-msg err"; };
    if (!f.name.value.trim() || !f.email.value.trim() || !f.message.value.trim()) return err("Please fill in your name, email and message.");
    if (!f.email.checkValidity()) return err("That email address doesn't look right.");
    send.disabled = true; send.textContent = "Sending…"; msg.textContent = ""; msg.className = "cf-msg";
    const data = Object.assign({
      access_key: ACCESS_KEY,
      subject: M.subject(f),
      from_name: "Iron Reef website",
      form: M.title,
      name: f.name.value.trim(), email: f.email.value.trim()
    }, M.data(f), { message: f.message.value.trim(), page: location.pathname, botcheck: f.botcheck.checked });
    try {
      const r = await fetch("https://api.web3forms.com/submit", {
        method: "POST", headers: {"Content-Type": "application/json", Accept: "application/json"}, body: JSON.stringify(data)
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.success) throw new Error(j.message || "failed");
      f.hidden = true; dlg.querySelector(".cf-done").hidden = false;
    } catch (x) {
      err('Sorry, that didn\'t go through. Please try again, or email <a href="mailto:info@ironreefllc.com">info@ironreefllc.com</a>.');
      send.disabled = false; send.textContent = M.send;
    }
  }
})();
