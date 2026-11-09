/**
 * @typedef {object} PathItem
 * @property {"Dir"|"SymlinkDir"|"File"|"SymlinkFile"} path_type
 * @property {string} name
 * @property {number} mtime
 * @property {number} size
 * @property {boolean} allow_upload
 * @property {boolean} allow_delete
 * @property {boolean} readonly_descendant
 */

/**
 * @typedef {object} DATA
 * @property {string} href
 * @property {string} uri_prefix
 * @property {"Index" | "Edit" | "View"} kind
 * @property {PathItem[]} paths
 * @property {boolean} allow_upload
 * @property {boolean} allow_delete
 * @property {boolean} allow_search
 * @property {boolean} allow_archive
 * @property {boolean} auth
 * @property {string} user
 * @property {boolean} dir_exists
 * @property {string} editable
 */

var DUFS_MAX_UPLOADINGS = 1;

/**
 * @type {DATA} DATA
 */
var DATA;

/**
 * @type {string}
 */
var DIR_EMPTY_NOTE;

/**
 * @type {PARAMS}
 * @typedef {object} PARAMS
 * @property {string} q
 * @property {string} sort
 * @property {string} order
 */
const PARAMS = Object.fromEntries(new URLSearchParams(window.location.search).entries());

const IFRAME_FORMATS = [
  ".pdf",
  ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg",
  ".mp4", ".mov", ".avi", ".wmv", ".flv", ".webm",
  ".mp3", ".ogg", ".wav", ".m4a",
];

const MAX_SUBPATHS_COUNT = 1000;

const ICONS = {
  dir: `<svg height="18" viewBox="0 0 16 16" width="18" fill="#eab308"><path d="M1.75 1A1.75 1.75 0 0 0 0 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0 0 16 13.25v-8.5A1.75 1.75 0 0 0 14.25 3H7.5a.25.25 0 0 1-.2-.1l-.9-1.2C6.07 1.26 5.55 1 5 1H1.75z"/></svg>`,
  symlinkDir: `<svg height="18" viewBox="0 0 16 16" width="18" fill="#ca8a04"><path d="M1.75 1A1.75 1.75 0 0 0 0 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0 0 16 13.25v-8.5A1.75 1.75 0 0 0 14.25 3H7.5a.25.25 0 0 1-.2-.1l-.9-1.2C6.07 1.26 5.55 1 5 1H1.75z"/><path fill="#fff" d="M11 9v2H9v1h3V9h-1zm-4 4l3-3-1-1-3 3 1 1z"/></svg>`,
  symlinkFile: `<svg height="18" viewBox="0 0 16 16" width="18" fill="#64748b"><path d="M4 1.75C4 .784 4.784 0 5.75 0h5.586a1.75 1.75 0 0 1 1.237.513l2.914 2.914c.328.328.513.774.513 1.237v9.586A1.75 1.75 0 0 1 14.25 16h-8.5A1.75 1.75 0 0 1 4 14.25V1.75z"/><path fill="#fff" d="M11 9v2H9v1h3V9h-1zm-4 4l3-3-1-1-3 3 1 1z"/></svg>`,
  file: `<svg height="18" viewBox="0 0 16 16" width="18" fill="#94a3b8"><path d="M3.75 1.5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h8.5a2 2 0 0 0 2-2V6.5a.5.5 0 0 0-.146-.354l-4.5-4.5A.5.5 0 0 0 9.25 1.5h-5.5zm5.5 1v3.5a.5.5 0 0 0 .5.5H13L9.25 2.5z"/></svg>`,
  fileImage: `<svg height="18" viewBox="0 0 16 16" width="18" fill="#10b981"><path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm3.5 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM1.002 13v-2.5l3.5-3.5 3 3 4-4 3.5 3.5V13h-14z"/></svg>`,
  fileVideo: `<svg height="18" viewBox="0 0 16 16" width="18" fill="#f43f5e"><path d="M0 3a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3zm6.79 3.093A.5.5 0 0 0 6 6.5v3a.5.5 0 0 0 .79.407l3.5-1.5a.5.5 0 0 0 0-.814l-3.5-1.5z"/></svg>`,
  fileAudio: `<svg height="18" viewBox="0 0 16 16" width="18" fill="#f97316"><path d="M9 13c0 1.105-1.12 2-2.5 2S4 14.105 4 13s1.12-2 2.5-2c.397 0 .769.076 1.096.21A3.993 3.993 0 0 0 7 10V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2.5a.5.5 0 0 1-.5.5H9v7z"/></svg>`,
  fileArchive: `<svg height="18" viewBox="0 0 16 16" width="18" fill="#eab308"><path d="M2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H2zm6 1.5h1.5v1H8v-1zm0 2h1.5v1H8v-1zm0 2h1.5v1H8v-1zm0 2h1.5v1H8v-1zm-1 3h3v2.5H7V11.5z"/></svg>`,
  fileCode: `<svg height="18" viewBox="0 0 16 16" width="18" fill="#06b6d4"><path d="M10.478 1.647a.5.5 0 1 0-.956-.294l-4 13a.5.5 0 0 0 .956.294l4-13zM4.854 4.146a.5.5 0 0 1 0 .708L1.707 8l3.147 3.146a.5.5 0 0 1-.708.708l-3.5-3.5a.5.5 0 0 1 0-.708l3.5-3.5a.5.5 0 0 1 .708 0zm6.292 0a.5.5 0 0 0 0 .708L14.293 8l-3.147 3.146a.5.5 0 0 0 .708.708l3.5-3.5a.5.5 0 0 0 0-.708l-3.5-3.5a.5.5 0 0 0-.708 0z"/></svg>`,
  filePdf: `<svg height="18" viewBox="0 0 16 16" width="18" fill="#ef4444"><path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z"/><path d="M4.5 12h1v-1.5H7a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1H4.5V12zm1-2.5V8H7v1.5H5.5z"/></svg>`,
  download: `<svg width="15" height="15" viewBox="0 0 16 16"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/><path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/></svg>`,
  move: `<svg width="15" height="15" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1.5 1.5A.5.5 0 0 0 1 2v4.8a2.5 2.5 0 0 0 2.5 2.5h9.793l-3.347 3.346a.5.5 0 0 0 .708.708l4.2-4.2a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 8.3H3.5A1.5 1.5 0 0 1 2 6.8V2a.5.5 0 0 0-.5-.5z"/></svg>`,
  edit: `<svg width="15" height="15" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/></svg>`,
  delete: `<svg width="15" height="15" viewBox="0 0 16 16"><path d="M6.854 7.146a.5.5 0 1 0-.708.708L7.293 9l-1.147 1.146a.5.5 0 0 0 .708.708L8 9.707l1.146 1.147a.5.5 0 0 0 .708-.708L8.707 9l1.147-1.146a.5.5 0 0 0-.708-.708L8 8.293 6.854 7.146z"/><path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z"/></svg>`,
  view: `<svg width="15" height="15" viewBox="0 0 16 16"><path d="M4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm0 1h8a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1"/></svg>`,
}

/**
 * @type Map<string, Uploader>
 */
const failUploaders = new Map();

/**
 * @type Element
 */
let $pathsTable;
/**
 * @type Element
 */
let $pathsTableHead;
/**
 * @type Element
 */
let $pathsTableBody;
/**
 * @type Element
 */
let $uploadersTable;
/**
 * @type Element
 */
let $emptyFolder;
/**
 * @type Element
 */
let $editor;
/**
 * @type Element
 */
let $loginBtn;
/**
 * @type Element
 */
let $logoutBtn;
/**
 * @type Element
 */
let $userName;

const selectedIndices = new Set();
let lastCheckedIndex = null;

function setupThemeToggle() {
  const btn = document.getElementById("themeToggleBtn");
  if (!btn) return;

  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") ||
      (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }

  btn.addEventListener("click", () => {
    const current = currentTheme();
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("dufs-theme", next);
  });
}

function setupViewMode() {
  const btn = document.getElementById("viewToggleBtn");
  if (!btn) return;

  const iconGrid = btn.querySelector(".icon-grid");
  const iconList = btn.querySelector(".icon-list");

  function updateIcon(mode) {
    if (mode === "grid") {
      iconGrid?.classList.add("hidden");
      iconList?.classList.remove("hidden");
      btn.title = "Switch to list view";
    } else {
      iconGrid?.classList.remove("hidden");
      iconList?.classList.add("hidden");
      btn.title = "Switch to grid view";
    }
  }

  const currentMode = document.documentElement.getAttribute("data-view") || "list";
  updateIcon(currentMode);

  btn.addEventListener("click", () => {
    const isGrid = document.documentElement.getAttribute("data-view") === "grid";
    const nextMode = isGrid ? "list" : "grid";
    document.documentElement.setAttribute("data-view", nextMode);
    localStorage.setItem("dufs-view", nextMode);
    updateIcon(nextMode);
  });
}

function showConfirmDialog(title, message) {
  return new Promise((resolve) => {
    const modal = document.getElementById("confirmModal");
    const titleEl = document.getElementById("modalTitle");
    const msgEl = document.getElementById("modalMessage");
    const cancelBtn = document.getElementById("modalCancelBtn");
    const confirmBtn = document.getElementById("modalConfirmBtn");

    if (!modal) {
      return resolve(confirm(message));
    }

    titleEl.textContent = title;
    msgEl.textContent = message;
    modal.classList.remove("hidden");

    function cleanup(result) {
      modal.classList.add("hidden");
      cancelBtn.removeEventListener("click", onCancel);
      confirmBtn.removeEventListener("click", onConfirm);
      window.removeEventListener("keydown", onKeyDown);
      resolve(result);
    }

    function onCancel() { cleanup(false); }
    function onConfirm() { cleanup(true); }
    function onKeyDown(e) {
      if (e.key === "Escape") cleanup(false);
      else if (e.key === "Enter") cleanup(true);
    }

    cancelBtn.addEventListener("click", onCancel);
    confirmBtn.addEventListener("click", onConfirm);
    window.addEventListener("keydown", onKeyDown);
  });
}

function showToast(message, type = "info", duration = 3000) {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  let iconSvg = "";
  if (type === "success") {
    iconSvg = `<svg width="16" height="16" viewBox="0 0 16 16" fill="#10b981"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/></svg>`;
  } else if (type === "error") {
    iconSvg = `<svg width="16" height="16" viewBox="0 0 16 16" fill="#ef4444"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/></svg>`;
  } else {
    iconSvg = `<svg width="16" height="16" viewBox="0 0 16 16" fill="#2563eb"><path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/></svg>`;
  }

  toast.innerHTML = `<span style="display:inline-flex;align-items:center;">${iconSvg}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(12px) scale(0.95)";
    setTimeout(() => toast.remove(), 250);
  }, duration);
}

function canDeleteFile(file) {
  if (!file) return false;
  if (file.readonly_descendant) return false;
  return file.allow_delete ?? DATA.allow_delete ?? false;
}

function canUploadFile(file) {
  if (!file) return false;
  return file.allow_upload ?? DATA.allow_upload ?? false;
}

function canMoveFile(file) {
  return canUploadFile(file) && canDeleteFile(file);
}

function selectAllItems(state) {
  if (!DATA.paths) return;
  for (let i = 0; i < DATA.paths.length; i++) {
    const file = DATA.paths[i];
    if (file && canDeleteFile(file)) {
      if (state) selectedIndices.add(i);
      else selectedIndices.delete(i);
    }
  }
  updateSelectionUI();
}

function updateSelectionUI() {
  const selectAllCb = document.getElementById("selectAllCheckbox");
  const batchDock = document.getElementById("batchActionDock");
  const selectionBar = document.getElementById("selectionBar");
  const countEl = document.getElementById("selectedCount");
  const topCountEl = document.getElementById("topSelectedCount");

  if (DATA.paths) {
    for (let i = 0; i < DATA.paths.length; i++) {
      const row = document.getElementById(`addPath${i}`);
      const cb = row?.querySelector(".select-item");
      const isSelected = selectedIndices.has(i);
      if (row) row.classList.toggle("selected", isSelected);
      if (cb) cb.checked = isSelected;
    }
  }

  const count = selectedIndices.size;
  if (countEl) countEl.textContent = count;
  if (topCountEl) topCountEl.textContent = count;

  if (batchDock) {
    if (count > 0) {
      batchDock.classList.remove("hidden");
    } else {
      batchDock.classList.add("hidden");
    }
  }

  if (selectionBar) {
    if (count > 0) {
      selectionBar.classList.remove("hidden");
    } else {
      selectionBar.classList.add("hidden");
    }
  }

  if (selectAllCb && DATA.paths) {
    const selectableTotal = DATA.paths.filter(p => p && canDeleteFile(p)).length;
    if (selectableTotal === 0) {
      selectAllCb.checked = false;
      selectAllCb.indeterminate = false;
      selectAllCb.disabled = true;
    } else if (count === 0) {
      selectAllCb.checked = false;
      selectAllCb.indeterminate = false;
      selectAllCb.disabled = false;
    } else if (count >= selectableTotal) {
      selectAllCb.checked = true;
      selectAllCb.indeterminate = false;
      selectAllCb.disabled = false;
    } else {
      selectAllCb.checked = false;
      selectAllCb.indeterminate = true;
      selectAllCb.disabled = false;
    }
  }
}

function setupBatchActions() {
  const batchClearBtn = document.getElementById("batchClearBtn");
  const batchDeleteBtn = document.getElementById("batchDeleteBtn");
  const batchDownloadBtn = document.getElementById("batchDownloadBtn");

  const topSelectAllBtn = document.getElementById("topSelectAllBtn");
  const topClearBtn = document.getElementById("topClearBtn");
  const topBatchDeleteBtn = document.getElementById("topBatchDeleteBtn");
  const topBatchDownloadBtn = document.getElementById("topBatchDownloadBtn");

  if (topSelectAllBtn) {
    topSelectAllBtn.addEventListener("click", () => selectAllItems(true));
  }

  if (topClearBtn) {
    topClearBtn.addEventListener("click", () => {
      selectedIndices.clear();
      updateSelectionUI();
    });
  }

  if (topBatchDeleteBtn) {
    topBatchDeleteBtn.addEventListener("click", batchDeleteSelected);
  }

  if (topBatchDownloadBtn) {
    topBatchDownloadBtn.addEventListener("click", batchDownloadSelected);
  }

  if (batchClearBtn) {
    batchClearBtn.addEventListener("click", () => {
      selectedIndices.clear();
      updateSelectionUI();
    });
  }

  if (batchDeleteBtn) {
    batchDeleteBtn.addEventListener("click", batchDeleteSelected);
  }

  if (batchDownloadBtn) {
    batchDownloadBtn.addEventListener("click", batchDownloadSelected);
  }

  window.addEventListener("keydown", (e) => {
    const tag = e.target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || e.target.isContentEditable) {
      return;
    }

    if (e.key === "Escape") {
      if (selectedIndices.size > 0) {
        selectedIndices.clear();
        updateSelectionUI();
      }
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
      e.preventDefault();
      selectAllItems(true);
    }
  });

  if ($pathsTableBody) {
    $pathsTableBody.addEventListener("click", (e) => {
      if (e.target.closest("a") || e.target.closest(".action-btn")) {
        return;
      }
      const row = e.target.closest("tr.path-row");
      if (!row) return;
      const index = parseInt(row.dataset.index, 10);
      const file = DATA.paths[index];
      if (!file || !canDeleteFile(file)) return;

      const checkbox = row.querySelector(".select-item");
      if (!checkbox || checkbox.disabled) return;

      if (e.target === checkbox) {
        if (e.shiftKey && lastCheckedIndex !== null) {
          const start = Math.min(lastCheckedIndex, index);
          const end = Math.max(lastCheckedIndex, index);
          const state = checkbox.checked;
          for (let i = start; i <= end; i++) {
            const item = DATA.paths[i];
            if (item && canDeleteFile(item)) {
              if (state) selectedIndices.add(i);
              else selectedIndices.delete(i);
              const cb = document.querySelector(`.select-item[data-index="${i}"]`);
              if (cb) cb.checked = state;
            }
          }
        } else {
          if (checkbox.checked) selectedIndices.add(index);
          else selectedIndices.delete(index);
          lastCheckedIndex = index;
        }
        updateSelectionUI();
        return;
      }

      checkbox.checked = !checkbox.checked;
      if (checkbox.checked) selectedIndices.add(index);
      else selectedIndices.delete(index);
      lastCheckedIndex = index;
      updateSelectionUI();
    });
  }
}

async function batchDeleteSelected() {
  const indices = Array.from(selectedIndices).filter(i => {
    const f = DATA.paths[i];
    return f && canDeleteFile(f);
  });

  if (indices.length === 0) return;

  const confirmed = await showConfirmDialog(
    "Delete Multiple Items",
    `Are you sure you want to permanently delete ${indices.length} selected item${indices.length > 1 ? "s" : ""}?`
  );
  if (!confirmed) return;

  showToast(`Deleting ${indices.length} item(s)...`, "info", 4000);

  const concurrency = 4;
  let active = 0;
  let cursor = 0;
  let successCount = 0;
  let failedCount = 0;

  try {
    await checkAuth();
  } catch (err) {
    showToast(`Auth error: ${err.message}`, "error");
    return;
  }

  await new Promise((resolve) => {
    function next() {
      if (cursor >= indices.length && active === 0) {
        return resolve();
      }
      while (active < concurrency && cursor < indices.length) {
        const idx = indices[cursor++];
        const file = DATA.paths[idx];
        if (!file) continue;
        active++;
        fetch(newUrl(file.name), { method: "DELETE" })
          .then(async (res) => {
            await assertResOK(res);
            document.getElementById(`addPath${idx}`)?.remove();
            DATA.paths[idx] = null;
            selectedIndices.delete(idx);
            successCount++;
          })
          .catch((err) => {
            console.error(`Failed to delete ${file.name}:`, err);
            failedCount++;
          })
          .finally(() => {
            active--;
            next();
          });
      }
    }
    next();
  });

  if (failedCount === 0) {
    showToast(`Successfully deleted ${successCount} item${successCount > 1 ? "s" : ""}`, "success");
  } else {
    showToast(`Deleted ${successCount} item(s), ${failedCount} failed`, "error");
  }

  if (!DATA.paths.find(v => !!v)) {
    $pathsTable.classList.add("hidden");
    $emptyFolder.textContent = DIR_EMPTY_NOTE;
    $emptyFolder.classList.remove("hidden");
  }

  updateSelectionUI();
}

function batchDownloadSelected() {
  const indices = Array.from(selectedIndices).filter(i => !!DATA.paths[i]);
  if (indices.length === 0) return;

  if (indices.length === 1) {
    const file = DATA.paths[indices[0]];
    const url = newUrl(file.name);
    if (file.path_type.endsWith("Dir")) {
      window.open(url + "/?zip", "_blank");
    } else {
      triggerDownload(url, file.name);
    }
    return;
  }

  showToast(`Downloading ${indices.length} items...`, "info");
  indices.forEach((idx, i) => {
    const file = DATA.paths[idx];
    if (!file) return;
    const url = newUrl(file.name);
    const downloadUrl = file.path_type.endsWith("Dir") ? (url + "/?zip") : url;
    setTimeout(() => {
      triggerDownload(downloadUrl, file.name);
    }, i * 250);
  });
}

function triggerDownload(url, filename) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => a.remove(), 1000);
}

// manage unload event to prevent leaving with uploads in progress
const beforeUnloadHandler = (event) => {
  if (Uploader.queues.length > 0 || Uploader.runnings > 0) {
    event.preventDefault();
    event.returnValue = '';
    return ''; // for some browsers
  }
};

async function initialize() {
  const $indexData = document.getElementById('index-data');
  if (!$indexData) {
    alert("No data");
    return;
  }

  DATA = JSON.parse(decodeBase64($indexData.innerHTML));
  DIR_EMPTY_NOTE = PARAMS.q ? 'No results' : DATA.dir_exists ? 'Empty folder' : 'Folder will be created when a file is uploaded';

  await ready();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize, {
    once: true,
  });
} else {
  queueMicrotask(initialize);
}

async function ready() {
  $pathsTable = document.querySelector(".paths-table");
  $pathsTableHead = document.querySelector(".paths-table thead");
  $pathsTableBody = document.querySelector(".paths-table tbody");
  $uploadersTable = document.querySelector(".uploaders-table");
  $emptyFolder = document.querySelector(".empty-folder");
  $editor = document.querySelector(".editor");
  $loginBtn = document.querySelector(".login-btn");
  $logoutBtn = document.querySelector(".logout-btn");
  $userName = document.querySelector(".user-name");

  window.addEventListener('beforeunload', beforeUnloadHandler);

  addBreadcrumb(DATA.href, DATA.uri_prefix);
  setupThemeToggle();
  setupViewMode();

  if (DATA.kind === "Index") {
    document.title = `Index of ${DATA.href} - Dufs`;
    document.querySelector(".index-page").classList.remove("hidden");

    await setupIndexPage();
  } else if (DATA.kind === "Edit") {
    document.title = `Edit ${DATA.href} - Dufs`;
    document.querySelector(".editor-page").classList.remove("hidden");

    await setupEditorPage();
  } else if (DATA.kind === "View") {
    document.title = `View ${DATA.href} - Dufs`;
    document.querySelector(".editor-page").classList.remove("hidden");

    await setupEditorPage();
  }
}

class Uploader {
  /**
   *
   * @param {File} file
   * @param {string[]} pathParts
   */
  constructor(file, pathParts) {
    /**
     * @type Element
     */
    this.$status = null;
    /**
     * @type Element
     */
    this.$size = null;
    /**
     * @type Element
     */
    this.$percent = null;
    /**
     * @type Element
     */
    this.$speed = null;
    /**
     * @type Element
     */
    this.$eta = null;
    // speed ring buffer, mirrors curl's progress meter (6 records, one per
    // second, giving a 5-second window) so the displayed speed stays stable
    this.startTime = 0;
    this.speedRecords = 0;
    this.speedAmounts = [];
    this.speedTimes = [];
    this.currentSpeed = 0;
    this.uploadOffset = 0;
    this.lastUptime = 0;
    this.name = [...pathParts, file.name].join("/");
    this.idx = Uploader.globalIdx++;
    this.file = file;
    this.url = newUrl(this.name);
  }

  upload() {
    const { idx, name, url } = this;
    const encodedName = encodedStr(name);
    $uploadersTable.insertAdjacentHTML("beforeend", `
  <tr id="upload${idx}" class="uploader">
    <td class="path cell-icon">
      ${getPathSvg({ name, path_type: "File" })}
    </td>
    <td class="path cell-name">
      <a href="${url}">${encodedName}</a>
    </td>
    <td class="cell-status" id="uploadStatus${idx}"></td>
    <td class="cell-size" id="uploadSize${idx}"></td>
    <td class="cell-percent" id="uploadPercent${idx}"></td>
    <td class="cell-speed" id="uploadSpeed${idx}"></td>
    <td class="cell-eta" id="uploadEta${idx}"></td>
  </tr>`);
    $uploadersTable.classList.remove("hidden");
    $emptyFolder.classList.add("hidden");
    this.$status = document.getElementById(`uploadStatus${idx}`);
    this.$percent = document.getElementById(`uploadPercent${idx}`);
    this.$size = document.getElementById(`uploadSize${idx}`);
    this.$speed = document.getElementById(`uploadSpeed${idx}`);
    this.$eta = document.getElementById(`uploadEta${idx}`);
    this.$status.textContent = "-";
    this.$percent.textContent = formatPercent(0);
    this.$size.textContent = formatUploadSize(0, this.file.size);
    this.$status.addEventListener("click", e => {
      const nodeId = e.target.id;
      const matches = /^retry(\d+)$/.exec(nodeId);
      if (matches) {
        const id = parseInt(matches[1]);
        let uploader = failUploaders.get(id);
        if (uploader) uploader.retry();
      }
    });
    Uploader.queues.push(this);
    Uploader.runQueue();
  }

  ajax() {
    const { url } = this;

    this.startTime = Date.now();
    this.lastUptime = this.startTime;
    this.speedRecords = 1;
    this.speedAmounts = [0];
    this.speedTimes = [0];
    this.currentSpeed = 0;
    this.$status.textContent = "↑";

    const ajax = new XMLHttpRequest();
    ajax.upload.addEventListener("progress", e => this.progress(e), false);
    ajax.addEventListener("readystatechange", () => {
      if (ajax.readyState === 4) {
        if (ajax.status >= 200 && ajax.status < 300) {
          this.complete();
        } else {
          if (ajax.status != 0) {
            const code = ajax.getResponseHeader("x-dufs-error-code");
            if (code === "upload-disabled") {
              this.fail("upload is disabled");
            } else if (code === "delete-disabled") {
              this.fail("overwriting is disabled");
            } else if (code === "readonly-descendant") {
              this.fail("directory contains read-only entries");
            } else {
              this.fail(`${ajax.status} ${ajax.statusText}`);
            }
          }
        }
      }
    })
    ajax.addEventListener("error", () => this.fail(), false);
    ajax.addEventListener("abort", () => this.fail(), false);
    if (this.uploadOffset > 0) {
      ajax.open("PATCH", url);
      ajax.setRequestHeader("X-Update-Range", "append");
      ajax.send(this.file.slice(this.uploadOffset));
    } else {
      ajax.open("PUT", url);
      ajax.send(this.file);
      // setTimeout(() => ajax.abort(), 3000);
    }
  }

  async retry() {
    const { url } = this;
    let res = await fetch(url, {
      method: "HEAD",
    });
    let uploadOffset = 0;
    if (res.status == 200) {
      let value = res.headers.get("content-length");
      uploadOffset = parseInt(value) || 0;
    }
    this.uploadOffset = uploadOffset;
    this.ajax();
  }

  progress(event) {
    const now = Date.now();
    this.calcSpeed(now - this.startTime, event.loaded);
    if (now - this.lastUptime < 300) return; // throttle update for safari
    this.lastUptime = now;
    const uploadedSize = event.loaded + this.uploadOffset;
    const [speedValue, speedUnit] = formatFileSize(this.currentSpeed);
    this.$status.textContent = "↑";
    this.$percent.textContent = formatPercent((uploadedSize / this.file.size) * 100);
    this.$size.textContent = formatUploadSize(uploadedSize, this.file.size);
    this.$speed.textContent = `${speedValue} ${speedUnit}/s`;
    this.$eta.textContent = formatDuration(this.currentSpeed > 0 ? (event.total - event.loaded) / this.currentSpeed : Infinity);
  }

  /**
   * Update the smoothed speed using curl's progress meter algorithm: keep a
   * 6-record ring buffer (one record per second, a 5-second window), add a
   * record at most once per second, and average over the buffered window.
   * @param {number} elapsed milliseconds since the transfer started
   * @param {number} amount bytes transferred so far
   */
  calcSpeed(elapsed, amount) {
    const records = 6;
    const iNext = this.speedRecords % records;
    let iLatest = iNext > 0 ? iNext - 1 : records - 1;
    if (elapsed - this.speedTimes[iLatest] < 1000) return;
    this.speedRecords++;
    iLatest = iNext;
    this.speedAmounts[iLatest] = amount;
    this.speedTimes[iLatest] = elapsed;
    const iOldest = this.speedRecords < records ? 0 : (iLatest + 1) % records;
    const duration = this.speedTimes[iLatest] - this.speedTimes[iOldest];
    const delta = this.speedAmounts[iLatest] - this.speedAmounts[iOldest];
    this.currentSpeed = duration > 0 ? delta / duration * 1000 : 0;
  }

  complete() {
    this.$status.textContent = "✓";
    this.$percent.textContent = formatPercent(100);
    this.$size.textContent = formatUploadSize(this.file.size, this.file.size);
    this.$speed.textContent = "";
    this.$eta.textContent = "";
    failUploaders.delete(this.idx);
    Uploader.runnings--;
    if (Uploader.queues.length === 0 && Uploader.runnings === 0 && failUploaders.size === 0) {
      setTimeout(() => location.reload(), 600);
    } else {
      Uploader.runQueue();
    }
  }

  fail(reason = "") {
    this.$status.innerHTML = `<span title="${reason}">✗</span><span class="retry-btn" id="retry${this.idx}" title="Retry">↻</span>`;
    this.$speed.textContent = "";
    this.$eta.textContent = "";
    failUploaders.set(this.idx, this);
    Uploader.runnings--;
    Uploader.runQueue();
  }
}

Uploader.globalIdx = 0;

Uploader.runnings = 0;

Uploader.auth = false;

/**
 * @type Uploader[]
 */
Uploader.queues = [];


Uploader.runQueue = async () => {
  if (Uploader.runnings >= DUFS_MAX_UPLOADINGS) return;
  if (Uploader.queues.length == 0) return;
  Uploader.runnings++;
  let uploader = Uploader.queues.shift();
  if (!Uploader.auth) {
    Uploader.auth = true;
    try {
      await checkAuth();
    } catch {
      Uploader.auth = false;
    }
  }
  uploader.ajax();
}

/**
 * Add breadcrumb
 * @param {string} href
 * @param {string} uri_prefix
 */
function addBreadcrumb(href, uri_prefix) {
  const $breadcrumb = document.querySelector(".breadcrumb");
  let parts = [];
  if (href === "/") {
    parts = [""];
  } else {
    parts = href.split("/");
  }
  const len = parts.length;
  let path = uri_prefix;
  for (let i = 0; i < len; i++) {
    const name = parts[i];
    if (i > 0) {
      if (!path.endsWith("/")) {
        path += "/";
      }
      path += encodeURIComponent(name);
    }
    const encodedName = encodedStr(name);
    if (i === 0) {
      $breadcrumb.insertAdjacentHTML("beforeend", `<a href="${path}" title="Root"><svg width="16" height="16" viewBox="0 0 16 16"><path d="M6.5 14.5v-3.505c0-.245.25-.495.5-.495h2c.25 0 .5.25.5.5v3.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5z"/></svg></a>`);
    } else if (i === len - 1) {
      $breadcrumb.insertAdjacentHTML("beforeend", `<b>${encodedName}</b>`);
    } else {
      $breadcrumb.insertAdjacentHTML("beforeend", `<a href="${path}">${encodedName}</a>`);
    }
    if (i !== len - 1) {
      $breadcrumb.insertAdjacentHTML("beforeend", `<span class="separator">/</span>`);
    }
  }
}

async function setupIndexPage() {
  setupBatchActions();

  if (DATA.allow_archive) {
    const $download = document.querySelector(".download");
    $download.href = baseUrl() + "?zip";
    $download.title = "Download folder as a .zip file";
    $download.classList.add("dlwt");
    $download.classList.remove("hidden");
  }

  if (DATA.allow_upload) {
    setupDropzone();
    setupUploadFile();
    setupNewFolder();
    setupNewFile();
  }

  if (DATA.auth) {
    await setupAuth();
  }

  if (DATA.allow_search) {
    setupSearch();
  }

  renderPathsTableHead();
  renderPathsTableBody();

  if (DATA.user) {
    setupDownloadWithToken();
  }
}

/**
 * Render path table thead
 */
function renderPathsTableHead() {
  const headerItems = [
    {
      name: "name",
      props: `colspan="2"`,
      text: "Name",
    },
    {
      name: "mtime",
      props: ``,
      text: "Last Modified",
    },
    {
      name: "size",
      props: ``,
      text: "Size",
    }
  ];
  $pathsTableHead.insertAdjacentHTML("beforeend", `
    <tr>
      <th class="cell-checkbox">
        <input type="checkbox" id="selectAllCheckbox" title="Select all" />
      </th>
      ${headerItems.map(item => {
    let svg = `<svg width="12" height="12" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M11.5 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L11 2.707V14.5a.5.5 0 0 0 .5.5zm-7-14a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L4 13.293V1.5a.5.5 0 0 1 .5-.5z"/></svg>`;
    let order = "desc";
    if (PARAMS.sort === item.name) {
      if (PARAMS.order === "desc") {
        order = "asc";
        svg = `<svg width="12" height="12" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1z"/></svg>`
      } else {
        svg = `<svg width="12" height="12" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5z"/></svg>`
      }
    }
    const qs = new URLSearchParams({ ...PARAMS, order, sort: item.name }).toString();
    const icon = `<span>${svg}</span>`
    return `<th class="cell-${item.name}" ${item.props}><a href="?${qs}">${item.text}${icon}</a></th>`
  }).join("\n")}
      <th class="cell-actions">Actions</th>
    </tr>
  `);

  const selectAllCb = document.getElementById("selectAllCheckbox");
  if (selectAllCb) {
    selectAllCb.addEventListener("change", (e) => {
      selectAllItems(e.target.checked);
    });
  }
}

/**
 * Render path table tbody
 */
function renderPathsTableBody() {
  if (DATA.paths && DATA.paths.length > 0) {
    const len = DATA.paths.length;
    if (len > 0) {
      $pathsTable.classList.remove("hidden");
    }
    // Show an action column when it is available for the current directory or
    // at least one entry. Rows without permission render the action disabled.
    const showMove =
      (DATA.allow_upload && DATA.allow_delete) ||
      DATA.paths.some((p) => canMoveFile(p));
    const showDelete =
      DATA.allow_delete || DATA.paths.some((p) => canDeleteFile(p));
    for (let i = 0; i < len; i++) {
      addPath(DATA.paths[i], i, showMove, showDelete);
    }
    updateSelectionUI();
  } else {
    $emptyFolder.textContent = DIR_EMPTY_NOTE;
    $emptyFolder.classList.remove("hidden");
  }
}

/**
 * Render an action button that the current account cannot use.
 * @param {string} icon
 * @param {string} title
 */
function disabledAction(icon, title) {
  return `<span class="action-btn disabled" title="${title}" aria-disabled="true">${icon}</span>`;
}

/**
 * Explain why an entry cannot be modified by the current account.
 * @param {PathItem} file
 * @param {"move" | "delete" | "edit"} action
 */
function deniedReason(file, action) {
  if (file.readonly_descendant) {
    return "the directory contains read-only entries";
  }
  if (action === "edit") {
    return "the file is read-only";
  }
  return "the entry is read-only";
}

/**
 * Add pathitem
 * @param {PathItem} file
 * @param {number} index
 * @param {boolean} showMove
 * @param {boolean} showDelete
 */
function addPath(file, index, showMove, showDelete) {
  const encodedName = encodedStr(file.name);
  let url = newUrl(file.name);
  let actionDelete = "";
  let actionDownload = "";
  let actionMove = "";
  let actionEdit = "";
  let actionView = "";
  let isDir = file.path_type.endsWith("Dir");
  if (isDir) {
    url += "/";
    if (DATA.allow_archive) {
      actionDownload = `
      <div class="action-btn">
        <a class="dlwt" href="${url}?zip" title="Download folder as a .zip file" download>${ICONS.download}</a>
      </div>`;
    }
  } else {
    actionDownload = `
    <div class="action-btn" >
      <a class="dlwt" href="${url}" title="Download file" download>${ICONS.download}</a>
    </div>`;
  }
  const canMove = canMoveFile(file);
  const canEdit = !isDir && canMove;
  if (showMove) {
    if (canMove) {
      actionMove = `<div onclick="movePath(${index})" class="action-btn" id="moveBtn${index}" title="Move & Rename">${ICONS.move}</div>`;
    } else {
      actionMove = disabledAction(ICONS.move, `Cannot move: ${deniedReason(file, "move")}`);
    }
    if (!isDir) {
      if (canEdit) {
        actionEdit = `<a class="action-btn" title="Edit file" target="_blank" href="${url}?edit">${ICONS.edit}</a>`;
      } else {
        actionEdit = disabledAction(ICONS.edit, `Cannot edit: ${deniedReason(file, "edit")}`);
      }
    }
  }
  const canDelete = canDeleteFile(file);
  if (showDelete) {
    if (canDelete) {
      actionDelete = `
    <div onclick="deletePath(${index})" class="action-btn" id="deleteBtn${index}" title="Delete">${ICONS.delete}</div>`;
    } else {
      actionDelete = disabledAction(ICONS.delete, `Cannot delete: ${deniedReason(file, "delete")}`);
    }
  }
  if (!canEdit && !isDir) {
    actionView = `<a class="action-btn" title="View file" target="_blank" href="${url}?view">${ICONS.view}</a>`;
  }
  let actionCell = `
  <td class="cell-actions">
    ${actionDownload}
    ${actionView}
    ${actionMove}
    ${actionDelete}
    ${actionEdit}
  </td>`;

  let sizeDisplay = isDir ? formatDirSize(file.size) : formatFileSize(file.size).join(" ");
  const isImg = !isDir && [".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp", ".ico", ".bmp", ".avif"].includes(extName(file.name).toLowerCase());
  const previewHtml = isImg
    ? `<div class="path-preview has-thumb"><img src="${url}" loading="lazy" alt="${encodedName}" class="thumb-img" onerror="this.parentElement.classList.remove('has-thumb');this.remove();" /><span class="icon-svg">${getPathSvg(file)}</span></div>`
    : `<div class="path-preview"><span class="icon-svg">${getPathSvg(file)}</span></div>`;

  $pathsTableBody.insertAdjacentHTML("beforeend", `
<tr id="addPath${index}" class="path-row" data-index="${index}">
  <td class="cell-checkbox">
    <input type="checkbox" class="select-item" data-index="${index}" ${canDelete ? "" : "disabled"} />
  </td>
  <td class="path cell-icon">
    ${previewHtml}
  </td>
  <td class="path cell-name">
    <a href="${url}" ${isDir ? "" : `target="_blank"`}>${encodedName}</a>
  </td>
  <td class="cell-mtime">${formatMtime(file.mtime)}</td>
  <td class="cell-size">${sizeDisplay}</td>
  ${actionCell}
</tr>`);
}

function setupDropzone() {
  ["drag", "dragstart", "dragend", "dragover", "dragenter", "dragleave", "drop"].forEach(name => {
    document.addEventListener(name, e => {
      e.preventDefault();
      e.stopPropagation();
    });
  });

  let dragCounter = 0;
  document.addEventListener("dragenter", () => {
    dragCounter++;
    document.body.classList.add("drag-active");
  });
  document.addEventListener("dragleave", () => {
    dragCounter--;
    if (dragCounter <= 0) {
      dragCounter = 0;
      document.body.classList.remove("drag-active");
    }
  });

  document.addEventListener("drop", async e => {
    dragCounter = 0;
    document.body.classList.remove("drag-active");
    if (!e.dataTransfer?.items?.[0]?.webkitGetAsEntry) {
      const files = Array.from(e.dataTransfer.files).filter(v => v.size > 0);
      for (const file of files) {
        new Uploader(file, []).upload();
      }
    } else {
      const entries = [];
      const len = e.dataTransfer.items.length;
      for (let i = 0; i < len; i++) {
        entries.push(e.dataTransfer.items[i].webkitGetAsEntry());
      }
      addFileEntries(entries, []);
    }
  });
}

async function setupAuth() {
  if (DATA.user) {
    $logoutBtn.classList.remove("hidden");
    $logoutBtn.addEventListener("click", logout);
    $userName.textContent = DATA.user;
  } else {
    $loginBtn.classList.remove("hidden");
    $loginBtn.addEventListener("click", async () => {
      try {
        await checkAuth("login");
      } catch { }
      location.reload();
    });
  }
}

function setupDownloadWithToken() {
  document.querySelectorAll("a.dlwt").forEach(link => {
    link.addEventListener("click", async e => {
      e.preventDefault();
      try {
        const link = e.currentTarget || e.target;
        const originalHref = link.getAttribute("href");
        const tokengenUrl = new URL(originalHref);
        tokengenUrl.searchParams.set("tokengen", "");
        const res = await fetch(tokengenUrl);
        if (!res.ok) throw new Error("Failed to fetch token");
        const token = await res.text();
        const downloadUrl = new URL(originalHref);
        downloadUrl.searchParams.set("token", token);
        const tempA = document.createElement("a");
        tempA.href = downloadUrl.toString();
        tempA.download = "";
        document.body.appendChild(tempA);
        tempA.click();
        document.body.removeChild(tempA);
      } catch (err) {
        alert(`Failed to download, ${err.message}`);
      }
    });
  });
}

function setupSearch() {
  const $searchbar = document.querySelector(".searchbar");
  $searchbar.classList.remove("hidden");
  $searchbar.addEventListener("submit", event => {
    event.preventDefault();
    const formData = new FormData($searchbar);
    const q = formData.get("q");
    let href = baseUrl();
    if (q) {
      href += "?q=" + q;
    }
    location.href = href;
  });

  const searchInput = document.getElementById("search");
  if (PARAMS.q) {
    searchInput.value = PARAMS.q;
  }

  // Live in-page filter
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const val = e.target.value.trim().toLowerCase();
      const rows = $pathsTableBody.querySelectorAll("tr.path-row");
      rows.forEach(row => {
        const idx = parseInt(row.dataset.index, 10);
        const file = DATA.paths[idx];
        if (!file) return;
        if (!val || file.name.toLowerCase().includes(val)) {
          row.classList.remove("hidden");
        } else {
          row.classList.add("hidden");
        }
      });
    });
  }
}

function setupUploadFile() {
  document.querySelector(".upload-file").classList.remove("hidden");
  document.getElementById("file").addEventListener("change", async e => {
    const files = e.target.files;
    for (let file of files) {
      new Uploader(file, []).upload();
    }
  });
}

function setupNewFolder() {
  const $newFolder = document.querySelector(".new-folder");
  $newFolder.classList.remove("hidden");
  $newFolder.addEventListener("click", () => {
    const name = prompt("Enter folder name");
    if (name) createFolder(name);
  });
}

function setupNewFile() {
  const $newFile = document.querySelector(".new-file");
  $newFile.classList.remove("hidden");
  $newFile.addEventListener("click", () => {
    const name = prompt("Enter file name");
    if (name) createFile(name);
  });
}

async function setupEditorPage() {
  const url = baseUrl();

  const $download = document.querySelector(".download");
  $download.classList.remove("hidden");
  $download.href = url;

  if (DATA.kind == "Edit") {
    if (DATA.allow_upload && DATA.allow_delete) {
      const $moveFile = document.querySelector(".move-file");
      $moveFile.classList.remove("hidden");
      $moveFile.addEventListener("click", async () => {
        const query = location.href.slice(url.length);
        const newFileUrl = await doMovePath(url);
        if (newFileUrl) {
          location.href = newFileUrl + query;
        }
      });
    }

    if (DATA.allow_delete) {
      const $deleteFile = document.querySelector(".delete-file");
      $deleteFile.classList.remove("hidden");
      $deleteFile.addEventListener("click", async () => {
        const url = baseUrl();
        const name = baseName(url);
        await doDeletePath(name, url, () => {
          location.href = location.href.split("/").slice(0, -1).join("/");
        });
      });
    }

    if (DATA.editable && DATA.allow_upload) {
      const $saveBtn = document.querySelector(".save-btn");
      $saveBtn.classList.remove("hidden");
      $saveBtn.addEventListener("click", saveChange);
    }
  } else if (DATA.kind == "View") {
    $editor.readonly = true;
  }

  if (!DATA.editable) {
    const $notEditable = document.querySelector(".not-editable");
    const url = baseUrl();
    const ext = extName(baseName(url));
    if (IFRAME_FORMATS.find(v => v === ext)) {
      $notEditable.insertAdjacentHTML("afterend", `<iframe src="${url}" sandbox width="100%" height="${window.innerHeight - 100}px"></iframe>`);
    } else {
      $notEditable.classList.remove("hidden");
      $notEditable.textContent = "Cannot edit because file is too large or binary.";
    }
    return;
  }

  $editor.classList.remove("hidden");
  $editor.readonly = DATA.kind == "View" || !DATA.allow_upload;
  try {
    const res = await fetch(baseUrl());
    await assertResOK(res);
    const encoding = getEncoding(res.headers.get("content-type"));
    if (encoding === "utf-8") {
      $editor.value = await res.text();
    } else {
      const bytes = await res.arrayBuffer();
      const dataView = new DataView(bytes);
      const decoder = new TextDecoder(encoding);
      $editor.value = decoder.decode(dataView);
    }
  } catch (err) {
    alert(`Failed to get file, ${err.message}`);
  }
}

/**
 * Delete path
 * @param {number} index
 * @returns
 */
async function deletePath(index) {
  const file = DATA.paths[index];
  if (!file) return;
  await doDeletePath(file.name, newUrl(file.name), () => {
    document.getElementById(`addPath${index}`)?.remove();
    DATA.paths[index] = null;
    selectedIndices.delete(index);
    updateSelectionUI();
    if (!DATA.paths.find(v => !!v)) {
      $pathsTable.classList.add("hidden");
      $emptyFolder.textContent = DIR_EMPTY_NOTE;
      $emptyFolder.classList.remove("hidden");
    }
  });
}

async function doDeletePath(name, url, cb) {
  const confirmed = await showConfirmDialog("Delete Item", `Are you sure you want to permanently delete \`${name}\`?`);
  if (!confirmed) return;
  try {
    await checkAuth();
    const res = await fetch(url, {
      method: "DELETE",
    });
    await assertResOK(res);
    cb();
    showToast(`Deleted \`${name}\``, "success");
  } catch (err) {
    if (err.code === "readonly-descendant") {
      showToast(`Cannot delete \`${name}\`: the directory contains read-only entries`, "error");
    } else if (err.code === "delete-disabled") {
      showToast(`Cannot delete \`${name}\`: delete is disabled`, "error");
    } else {
      showToast(`Cannot delete \`${name}\`: ${err.message}`, "error");
    }
  }
}

/**
 * Move path
 * @param {number} index
 * @returns
 */
async function movePath(index) {
  const file = DATA.paths[index];
  if (!file) return;
  const fileUrl = newUrl(file.name);
  const newFileUrl = await doMovePath(fileUrl);
  if (newFileUrl) {
    location.href = newFileUrl.split("/").slice(0, -1).join("/");
  }
}

async function doMovePath(fileUrl) {
  const fileUrlObj = new URL(fileUrl);

  const prefix = DATA.uri_prefix.slice(0, -1);

  const filePath = decodeURIComponent(fileUrlObj.pathname.slice(prefix.length));

  let newPath = prompt("Enter new path", filePath);
  if (!newPath) return;
  if (!newPath.startsWith("/")) newPath = "/" + newPath;
  if (filePath === newPath) return;
  const newFileUrl = fileUrlObj.origin + prefix + newPath.split("/").map(encodeURIComponent).join("/");

  try {
    await checkAuth();
    const res1 = await fetch(newFileUrl, {
      method: "HEAD",
    });
    if (res1.status === 200) {
      if (!confirm("Override existing file?")) {
        return;
      }
    }
    const res2 = await fetch(fileUrl, {
      method: "MOVE",
      headers: {
        "Destination": newFileUrl,
      }
    });
    await assertResOK(res2);
    return newFileUrl;
  } catch (err) {
    if (err.code === "readonly-descendant") {
      alert(`Cannot move \`${filePath}\`: the directory contains read-only entries`);
    } else if (err.code === "upload-disabled" || err.code === "delete-disabled") {
      alert(`Cannot move \`${filePath}\`: moving is disabled`);
    } else {
      alert(`Cannot move \`${filePath}\` to \`${newPath}\`, ${err.message}`);
    }
  }
}


/**
 * Save editor change
 */
async function saveChange() {
  try {
    await fetch(baseUrl(), {
      method: "PUT",
      body: $editor.value,
    });
    location.reload();
  } catch (err) {
    alert(`Failed to save file, ${err.message}`);
  }
}

async function checkAuth(variant) {
  if (!DATA.auth) return;
  const qs = variant ? `?${variant}` : "";
  const res = await fetch(baseUrl() + qs, {
    method: "CHECKAUTH",
  });
  await assertResOK(res);
  $loginBtn.classList.add("hidden");
  $logoutBtn.classList.remove("hidden");
  $userName.textContent = await res.text();
}

function logout() {
  if (!DATA.auth) return;
  const url = baseUrl();
  const xhr = new XMLHttpRequest();
  xhr.open("LOGOUT", url, true, DATA.user);
  xhr.onload = () => {
    location.href = url;
  }
  xhr.send();
}

/**
 * Create a folder
 * @param {string} name
 */
async function createFolder(name) {
  const url = newUrl(name);
  try {
    await checkAuth();
    const res = await fetch(url, {
      method: "MKCOL",
    });
    await assertResOK(res);
    location.href = url;
  } catch (err) {
    if (err.code === "already-exists") {
      alert(`Cannot create folder \`${name}\`: it already exists`);
    } else if (err.code === "upload-disabled") {
      alert(`Cannot create folder \`${name}\`: upload is disabled`);
    } else {
      alert(`Cannot create folder \`${name}\`, ${err.message}`);
    }
  }
}

async function createFile(name) {
  const url = newUrl(name);
  try {
    await checkAuth();
    const res = await fetch(url, {
      method: "PUT",
      body: "",
    });
    await assertResOK(res);
    location.href = url + "?edit";
  } catch (err) {
    if (err.code === "upload-disabled") {
      alert(`Cannot create file \`${name}\`: upload is disabled`);
    } else if (err.code === "delete-disabled") {
      alert(`Cannot create file \`${name}\`: delete is disabled`);
    } else {
      alert(`Cannot create file \`${name}\`, ${err.message}`);
    }
  }
}

async function addFileEntries(entries, dirs) {
  for (const entry of entries) {
    if (entry.isFile) {
      entry.file(file => {
        new Uploader(file, dirs).upload();
      });
    } else if (entry.isDirectory) {
      const dirReader = entry.createReader();

      const successCallback = entries => {
        if (entries.length > 0) {
          addFileEntries(entries, [...dirs, entry.name]);
          dirReader.readEntries(successCallback);
        }
      };

      dirReader.readEntries(successCallback);
    }
  }
}


function newUrl(name) {
  let url = baseUrl();
  if (!url.endsWith("/")) url += "/";
  url += name.split("/").map(encodeURIComponent).join("/");
  return url;
}

function baseUrl() {
  return location.href.split(/[?#]/)[0];
}

function baseName(url) {
  return decodeURIComponent(url.split("/").filter(v => v.length > 0).slice(-1)[0]);
}

function extName(filename) {
  const dotIndex = filename.lastIndexOf('.');

  if (dotIndex === -1 || dotIndex === 0 || dotIndex === filename.length - 1) {
    return '';
  }

  return filename.substring(dotIndex);
}

function getPathSvg(file) {
  if (!file) return ICONS.file;
  if (typeof file === "string") {
    switch (file) {
      case "Dir": return ICONS.dir;
      case "SymlinkFile": return ICONS.symlinkFile;
      case "SymlinkDir": return ICONS.symlinkDir;
      default: return ICONS.file;
    }
  }

  const path_type = file.path_type || "File";
  if (path_type === "Dir") return ICONS.dir;
  if (path_type === "SymlinkDir") return ICONS.symlinkDir;
  if (path_type === "SymlinkFile") return ICONS.symlinkFile;

  const name = file.name || "";
  const ext = extName(name).toLowerCase();
  if ([".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp", ".ico", ".bmp", ".avif"].includes(ext)) {
    return ICONS.fileImage;
  }
  if ([".mp4", ".mkv", ".mov", ".avi", ".webm", ".flv", ".wmv"].includes(ext)) {
    return ICONS.fileVideo;
  }
  if ([".mp3", ".wav", ".flac", ".ogg", ".m4a", ".aac"].includes(ext)) {
    return ICONS.fileAudio;
  }
  if ([".zip", ".tar", ".gz", ".7z", ".rar", ".bz2", ".xz"].includes(ext)) {
    return ICONS.fileArchive;
  }
  if ([".pdf"].includes(ext)) {
    return ICONS.filePdf;
  }
  if ([".js", ".ts", ".jsx", ".tsx", ".json", ".yaml", ".yml", ".py", ".rs", ".go", ".c", ".cpp", ".h", ".sh", ".bash", ".css", ".html", ".md", ".sql"].includes(ext)) {
    return ICONS.fileCode;
  }

  return ICONS.file;
}

function formatMtime(mtime) {
  if (!mtime) return "";
  const date = new Date(mtime);
  const year = date.getFullYear();
  const month = padZero(date.getMonth() + 1, 2);
  const day = padZero(date.getDate(), 2);
  const hours = padZero(date.getHours(), 2);
  const minutes = padZero(date.getMinutes(), 2);
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function padZero(value, size) {
  return ("0".repeat(size) + value).slice(-1 * size);
}

function formatDirSize(size) {
  const unit = size === 1 ? "item" : "items";
  const num = size >= MAX_SUBPATHS_COUNT ? `>${MAX_SUBPATHS_COUNT - 1}` : `${size}`;
  return ` ${num} ${unit}`;
}

function formatFileSize(size, unit) {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.max(0, unit ? sizes.indexOf(unit) : (size > 0 ? parseInt(Math.floor(Math.log(size) / Math.log(1024))) : 0));
  const raw = size > 0 ? size / Math.pow(1024, i) : 0;
  if (i === 0) return [Math.round(raw), "B"];
  return [raw.toFixed(1), sizes[i]];
}

function formatDuration(seconds) {
  if (!isFinite(seconds) || seconds <= 0) return "--:--";
  seconds = Math.ceil(seconds);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds - h * 3600) / 60);
  const s = seconds - h * 3600 - m * 60;
  if (h > 0) return `${padZero(h, 2)}:${padZero(m, 2)}:${padZero(s, 2)}`;
  return `${padZero(m, 2)}:${padZero(s, 2)}`;
}

function formatUploadSize(uploaded, total) {
  const unit = formatFileSize(total)[1];
  const [uploadedValue] = formatFileSize(uploaded, unit);
  const [totalValue] = formatFileSize(total, unit);
  return `${uploadedValue}/${totalValue} ${unit}`;
}

function formatPercent(percent) {
  return Math.round(percent) + "%";
}

function encodedStr(rawStr) {
  return rawStr.replace(/[\u00A0-\u9999<>\&]/g, function (i) {
    return '&#' + i.charCodeAt(0) + ';';
  });
}

async function assertResOK(res) {
  if (!(res.status >= 200 && res.status < 300)) {
    const err = new Error(await res.text() || `Invalid status ${res.status}`);
    err.code = res.headers.get("x-dufs-error-code");
    throw err;
  }
}

function getEncoding(contentType) {
  const charset = contentType?.split(";")[1];
  if (/charset/i.test(charset)) {
    let encoding = charset.split("=")[1];
    if (encoding) {
      return encoding.toLowerCase();
    }
  }
  return 'utf-8';
}

// Parsing base64 strings with Unicode characters
function decodeBase64(base64String) {
  const binString = atob(base64String);
  const len = binString.length;
  const bytes = new Uint8Array(len);
  const arr = new Uint32Array(bytes.buffer, 0, Math.floor(len / 4));
  let i = 0;
  for (; i < arr.length; i++) {
    arr[i] = binString.charCodeAt(i * 4) |
      (binString.charCodeAt(i * 4 + 1) << 8) |
      (binString.charCodeAt(i * 4 + 2) << 16) |
      (binString.charCodeAt(i * 4 + 3) << 24);
  }
  for (i = i * 4; i < len; i++) {
    bytes[i] = binString.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}