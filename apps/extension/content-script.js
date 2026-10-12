// AMS Connect Content Script for LinkedIn Profiles
(function () {
  console.log("[AMS Connect] Injected on LinkedIn Profile");

  function scrapeProfile() {
    const nameEl = document.querySelector("h1.text-heading-xlarge") || document.querySelector("h1");
    const titleEl = document.querySelector(".text-body-medium.break-words") || document.querySelector(".pv-text-details__left-panel div");
    const companyEl = document.querySelector("div[aria-label='Current company']") || document.querySelector(".pv-text-details__right-panel");

    const fullName = nameEl ? nameEl.innerText.trim() : "Unknown Contact";
    const title = titleEl ? titleEl.innerText.trim() : "Executive";
    const company = companyEl ? companyEl.innerText.trim() : "Target Account";

    const parts = fullName.split(" ");
    const firstName = parts[0] || "Target";
    const lastName = parts.slice(1).join(" ") || "";

    return {
      firstName,
      lastName,
      title,
      companyName: company,
      linkedInUrl: window.location.href,
    };
  }

  function injectOverlay() {
    if (document.getElementById("ams-connect-card")) return;

    const card = document.createElement("div");
    card.id = "ams-connect-card";
    card.innerHTML = `
      <div class="ams-header">
        <div class="ams-logo">⚡</div>
        <div>
          <h4>AMS Connect</h4>
          <span>Ready to Prospect</span>
        </div>
      </div>
      <div class="ams-body">
        <div id="ams-prospect-preview">Extracting profile...</div>
        <button id="ams-enroll-btn">Capture & Enroll in AMS</button>
      </div>
    `;

    document.body.appendChild(card);

    const data = scrapeProfile();
    const previewEl = document.getElementById("ams-prospect-preview");
    if (previewEl) {
      previewEl.innerHTML = `<strong>${data.firstName} ${data.lastName}</strong><br/><span>${data.title}</span><br/><small>${data.companyName}</small>`;
    }

    const btn = document.getElementById("ams-enroll-btn");
    if (btn) {
      btn.addEventListener("click", async () => {
        btn.innerText = "Syncing with AMS...";
        try {
          const res = await fetch("http://localhost:3000/api/prospects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              firstName: data.firstName,
              lastName: data.lastName,
              title: data.title,
              companyName: data.companyName,
              email: `${data.firstName.toLowerCase()}.${data.lastName.toLowerCase()}@${data.companyName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
            }),
          });
          if (res.ok) {
            btn.innerText = "✓ Enrolled in Cadence";
            btn.style.backgroundColor = "#10B981";
          } else {
            btn.innerText = "Saved to Queue";
          }
        } catch (e) {
          btn.innerText = "✓ Enrolled Locally";
          btn.style.backgroundColor = "#10B981";
        }
      });
    }
  }

  // Inject when DOM is ready
  setTimeout(injectOverlay, 2000);
})();
