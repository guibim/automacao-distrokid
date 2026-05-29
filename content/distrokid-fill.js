(() => {
  const CONTENT_SCRIPT_VERSION = "auto-v4";
  const MARK_MESSAGE_TYPE = "AUTO_DISTROKID_RUN_V4";
  const PING_TYPE = "AUTO_DISTROKID_PING_V4";

  if (window.__autoDistroKidBimzVersion === CONTENT_SCRIPT_VERSION) {
    return;
  }
  window.__autoDistroKidBimzVersion = CONTENT_SCRIPT_VERSION;

  const OVERLAY_ID = "auto-distrokid-bimz-status";
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

  // ── UI ──────────────────────────────────────────────────────────────────────

  function showStatus(message) {
    let overlay = document.querySelector(`#${OVERLAY_ID}`);
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = OVERLAY_ID;
      Object.assign(overlay.style, {
        position: "fixed",
        right: "18px",
        bottom: "18px",
        zIndex: "2147483647",
        maxWidth: "360px",
        padding: "12px 14px",
        border: "1px solid #d9e2ec",
        borderRadius: "8px",
        boxShadow: "0 18px 44px rgba(15, 23, 42, 0.24)",
        background: "#fff",
        color: "#172033",
        font: "13px/1.4 Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
      });
      document.documentElement.append(overlay);
    }
    overlay.textContent = message;
  }

  function hideStatusSoon() {
    window.setTimeout(() => document.querySelector(`#${OVERLAY_ID}`)?.remove(), 3500);
  }

  // ── DOM helpers ─────────────────────────────────────────────────────────────

  function setNativeSelectValue(select, value) {
    const descriptor = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value");
    if (descriptor?.set) descriptor.set.call(select, value);
    else select.value = value;
    select.dispatchEvent(new Event("input", { bubbles: true }));
    select.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function setNativeInputValue(input, value) {
    const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
    if (descriptor?.set) descriptor.set.call(input, value);
    else input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  async function waitForElement(selectorFn, timeout = 5000) {
    const startedAt = Date.now();
    while (Date.now() - startedAt < timeout) {
      const el = selectorFn();
      if (el) return el;
      await delay(150);
    }
    return null;
  }

  async function clickRadio(radio) {
    radio.scrollIntoView({ block: "center", inline: "center" });
    await delay(80);
    if (!radio.checked) {
      radio.click();
      radio.dispatchEvent(new Event("input", { bubbles: true }));
      radio.dispatchEvent(new Event("change", { bubbles: true }));
    }
    await delay(120);
  }

  async function clickCheckbox(checkbox) {
    checkbox.scrollIntoView({ block: "center", inline: "center" });
    await delay(80);
    if (!checkbox.checked) {
      checkbox.click();
      checkbox.dispatchEvent(new Event("input", { bubbles: true }));
      checkbox.dispatchEvent(new Event("change", { bubbles: true }));
    }
    await delay(120);
  }

  // ── Fase 1: Quantidade de músicas ───────────────────────────────────────────

  async function fase1SetSongCount(count) {
    const select = document.querySelector("#howManySongsOnThisAlbum");
    if (!select) return false;
    if (select.value !== String(count)) {
      setNativeSelectValue(select, String(count));
      await delay(800);
    }
    return true;
  }

  // ── Fase 2: Instrumental ────────────────────────────────────────────────────

  function getInstrumentalRadio(trackNumber) {
    const selectors = [
      `#js-instrumental-radio-button-${trackNumber}`,
      `input.distroInstrumental[type="radio"][track="${trackNumber}"][value="1"]`,
      `input[type="radio"][track="${trackNumber}"][name^="instrumental_"][value="1"]`
    ];
    return selectors.map(s => document.querySelector(s)).find(Boolean) || null;
  }

  async function fase2Instrumentais(count) {
    const marked = [];
    const missed = [];

    for (let track = 1; track <= count; track++) {
      showStatus(`Fase 2: instrumental ${track}/${count}...`);
      const radio = await waitForElement(() => getInstrumentalRadio(track));
      if (!radio) { missed.push(track); continue; }
      await clickRadio(radio);
      marked.push(track);
    }

    return { marked, missed };
  }

  // ── Fase 3: Campos de IA ────────────────────────────────────────────────────

  async function fase3Ai(count) {
    const missed = [];

    for (let track = 1; track <= count; track++) {
      showStatus(`Fase 3: IA faixa ${track}/${count}...`);

      // Radio "Sim" — value="1" distingue do radio "Não"
      const gate = await waitForElement(
        () => document.querySelector(`input.distroAiGate[track="${track}"][value="1"]`)
      );
      if (!gate) { missed.push(track); continue; }
      await clickRadio(gate);

      // Aguarda o modal SweetAlert2 abrir e encontra checkboxes dentro dele
      const musicCheckbox = await waitForElement(
        () => document.querySelector(".swal2-popup input.distroAiMusic"),
        6000
      );
      if (!musicCheckbox) { missed.push(track); continue; }
      await clickCheckbox(musicCheckbox);

      const recordingFull = await waitForElement(
        () => document.querySelector('.swal2-popup input.distroAiRecordingScope[value="full"]')
      );
      if (recordingFull) await clickCheckbox(recordingFull);

      // Clica "Guardar" para fechar o modal
      const saveBtn = await waitForElement(
        () => document.querySelector(".swal2-popup button.swal2-confirm")
      );
      if (saveBtn) {
        await delay(80);
        saveBtn.click();
        await delay(600); // Aguarda modal fechar antes da próxima faixa
      }
    }

    return { missed };
  }

  // ── Fase 4: Compositor ──────────────────────────────────────────────────────

  async function fase4Compositor() {
    const firstInput = document.querySelector('input[name="songwriter_real_name_first1"]');
    if (!firstInput) return false;
    setNativeInputValue(firstInput, "Guilherme");

    const middleInput = document.querySelector('input[name="songwriter_real_name_middle1"]');
    if (middleInput) setNativeInputValue(middleInput, "Bim");

    const lastInput = document.querySelector('input[name="songwriter_real_name_last1"]');
    if (lastInput) setNativeInputValue(lastInput, "Bimzao");

    await delay(200);

    // Clica em "Copia estes compositores para todas as canções neste álbum"
    const copyDiv = Array.from(document.querySelectorAll("div")).find(
      el => el.textContent.trim().startsWith("Copia estes compositores")
    );
    if (!copyDiv) return false;
    copyDiv.scrollIntoView({ block: "center" });
    await delay(80);
    copyDiv.click();

    // Aguarda 2s para o modal do SweetAlert2 aparecer
    await delay(2000);

    const execBtn = document.querySelector('button.swal2-confirm[aria-label="Confirmar"]');
    if (execBtn) {
      execBtn.click();
      await delay(400);
    }

    return true;
  }

  // ── Orquestrador principal ──────────────────────────────────────────────────

  async function runAll({ trackCount, composerFirstName, composerLastName }) {
    const count = Number(trackCount || 12);
    if (!Number.isInteger(count) || count < 1 || count > 35) {
      throw new Error("Quantidade invalida. Use um numero entre 1 e 35.");
    }

    showStatus(`Fase 1: configurando ${count} faixa(s)...`);
    await fase1SetSongCount(count);

    const { marked, missed: missedInstrumental } = await fase2Instrumentais(count);
    const { missed: missedAi } = await fase3Ai(count);

    showStatus("Fase 4: preenchendo compositor...");
    await fase4Compositor();

    const totalMissed = [...new Set([...missedInstrumental, ...missedAi])];
    if (totalMissed.length > 0) {
      showStatus(`Concluido. Faltaram faixas: ${totalMissed.join(", ")}.`);
    } else {
      showStatus(`Pronto: ${marked.length} faixa(s) preenchidas.`);
    }

    hideStatusSoon();
    return { ok: true, marked: marked.length, missed: totalMissed };
  }

  // ── Listener ────────────────────────────────────────────────────────────────

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === PING_TYPE) {
      sendResponse({ ok: true, version: CONTENT_SCRIPT_VERSION });
      return false;
    }

    if (message?.type !== MARK_MESSAGE_TYPE) {
      return false;
    }

    runAll(message.payload || {})
      .then(sendResponse)
      .catch(error => {
        showStatus(error.message || String(error));
        hideStatusSoon();
        sendResponse({ ok: false, error: error.message || String(error) });
      });

    return true;
  });
})();
