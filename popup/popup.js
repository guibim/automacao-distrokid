const form = document.querySelector("#instrumental-form");
const trackCountInput = document.querySelector("#track-count");
const fillButton = document.querySelector("#fill-button");
const statusEl = document.querySelector("#status");

const CONTENT_SCRIPT_VERSION = "auto-v5";
const MARK_MESSAGE_TYPE = "AUTO_DISTROKID_RUN_V5";
const PING_TYPE = "AUTO_DISTROKID_PING_V5";

function setStatus(message, tone = "") {
  statusEl.textContent = message;
  statusEl.dataset.tone = tone;
}

function tabsQuery(queryInfo) {
  return new Promise((resolve, reject) => {
    chrome.tabs.query(queryInfo, tabs => {
      const error = chrome.runtime.lastError;
      if (error) reject(error);
      else resolve(tabs);
    });
  });
}

function sendMessage(tabId, message) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, response => {
      const error = chrome.runtime.lastError;
      if (error) reject(error);
      else resolve(response);
    });
  });
}

function executeScript(tabId, files) {
  return new Promise((resolve, reject) => {
    chrome.scripting.executeScript({ target: { tabId }, files }, result => {
      const error = chrome.runtime.lastError;
      if (error) reject(error);
      else resolve(result);
    });
  });
}

async function getActiveDistroKidTab() {
  const [tab] = await tabsQuery({ active: true, currentWindow: true });
  if (!tab?.id) {
    throw new Error("Nenhuma aba ativa encontrada.");
  }
  if (!/^https:\/\/(www\.)?distrokid\.com\/new/i.test(tab.url || "")) {
    throw new Error("Abra https://distrokid.com/new/ antes de usar.");
  }
  return tab;
}

async function ensureContentScript(tabId) {
  try {
    const response = await sendMessage(tabId, { type: PING_TYPE });
    if (response?.version === CONTENT_SCRIPT_VERSION) return;
  } catch (_error) {
    // Script não carregado ou versão antiga
  }

  await executeScript(tabId, ["content/distrokid-fill.js"]);

  const response = await sendMessage(tabId, { type: PING_TYPE });
  if (response?.version !== CONTENT_SCRIPT_VERSION) {
    throw new Error("Atualize a pagina do DistroKid e tente novamente.");
  }
}

async function runFill(event) {
  event.preventDefault();

  const trackCount = Number(trackCountInput.value || 12);
  if (!Number.isInteger(trackCount) || trackCount < 1 || trackCount > 35) {
    setStatus("Quantidade deve estar entre 1 e 35.", "error");
    trackCountInput.focus();
    return;
  }

  const instrumentalValue = document.querySelector('input[name="instrumental"]:checked')?.value;
  const isInstrumental = instrumentalValue !== "nao";

  fillButton.disabled = true;
  setStatus("Executando fases...");

  try {
    const tab = await getActiveDistroKidTab();
    await ensureContentScript(tab.id);

    const payload = { trackCount, isInstrumental };

    let response;
    try {
      response = await sendMessage(tab.id, { type: MARK_MESSAGE_TYPE, payload });
    } catch (_error) {
      await executeScript(tab.id, ["content/distrokid-fill.js"]);
      response = await sendMessage(tab.id, { type: MARK_MESSAGE_TYPE, payload });
    }

    if (!response?.ok) {
      throw new Error(response?.error || "Nao foi possivel preencher as faixas.");
    }

    const missed = response.missed?.length || 0;
    if (missed > 0) {
      setStatus(`Preenchidas ${response.marked}; faltaram faixas: ${response.missed.join(", ")}.`, "warn");
    } else {
      setStatus(`Pronto: ${response.marked} faixa(s) preenchidas.`, "ok");
    }
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    fillButton.disabled = false;
  }
}

form.addEventListener("submit", runFill);
