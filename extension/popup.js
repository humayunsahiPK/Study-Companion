const API_BASE_URL = "http://localhost:8000";

const loginView = document.getElementById("login-view");
const recordView = document.getElementById("record-view");
const emailInput = document.getElementById("email-input");
const passwordInput = document.getElementById("password-input");
const loginBtn = document.getElementById("login-btn");
const loginError = document.getElementById("login-error");
const recordBtn = document.getElementById("record-btn");
const statusText = document.getElementById("status-text");
const recordStatus = document.getElementById("record-status");
const signoutBtn = document.getElementById("signout-btn");

init();

async function init() {
  const { access_token } = await chrome.storage.local.get("access_token");
  if (access_token) {
    showRecordView();
  } else {
    showLoginView();
  }
}

function showLoginView() {
  loginView.classList.remove("hidden");
  recordView.classList.add("hidden");
}

async function showRecordView() {
  loginView.classList.add("hidden");
  recordView.classList.remove("hidden");

  const { isRecording, lastRecordingStatus, lastRecordingMessage } =
    await chrome.storage.local.get([
      "isRecording",
      "lastRecordingStatus",
      "lastRecordingMessage",
    ]);

  updateRecordButton(Boolean(isRecording));

  if (lastRecordingStatus) {
    recordStatus.textContent = lastRecordingMessage || "";
    recordStatus.style.color =
      lastRecordingStatus === "error" ? "#e8785c" : "#6fdcb0";
  }
}

function updateRecordButton(isRecording) {
  if (isRecording) {
    recordBtn.textContent = "Stop recording";
    recordBtn.classList.add("recording");
    statusText.textContent = "Recording this tab...";
  } else {
    recordBtn.textContent = "Record";
    recordBtn.classList.remove("recording");
    statusText.textContent = "Ready to record.";
  }
}

loginBtn.addEventListener("click", async () => {
  loginError.textContent = "";
  loginBtn.disabled = true;
  loginBtn.textContent = "Signing in...";

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: emailInput.value,
        password: passwordInput.value,
      }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.detail || "Login failed.");
    }

    const data = await response.json();
    await chrome.storage.local.set({ access_token: data.access_token });
    showRecordView();
  } catch (err) {
    loginError.textContent = err.message;
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = "Sign in";
  }
});

recordBtn.addEventListener("click", async () => {
  const { isRecording } = await chrome.storage.local.get("isRecording");

  if (!isRecording) {
    recordStatus.textContent = "";
    const response = await chrome.runtime.sendMessage({
      action: "start-recording",
    });

    if (response && response.success) {
      await chrome.storage.local.set({
        isRecording: true,
        lastRecordingStatus: null,
        lastRecordingMessage: null,
      });
      updateRecordButton(true);
    } else {
      recordStatus.textContent =
        (response && response.error) || "Could not start recording.";
      recordStatus.style.color = "#e8785c";
    }
  } else {
    await chrome.runtime.sendMessage({ action: "stop-recording" });
    await chrome.storage.local.set({ isRecording: false });
    updateRecordButton(false);
    recordStatus.textContent = "Uploading...";
    recordStatus.style.color = "#7d859c";
  }
});

// listen for storage changes instead of polling, since the upload
// happens in the offscreen doc even if this popup gets closed
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") return;

  if (changes.lastRecordingStatus || changes.lastRecordingMessage) {
    const status = changes.lastRecordingStatus?.newValue;
    const message = changes.lastRecordingMessage?.newValue;

    if (status) {
      recordStatus.textContent = message || "";
      recordStatus.style.color = status === "error" ? "#e8785c" : "#6fdcb0";
    }
  }

  if (changes.isRecording) {
    updateRecordButton(Boolean(changes.isRecording.newValue));
  }
});

signoutBtn.addEventListener("click", async () => {
  await chrome.storage.local.remove("access_token");
  showLoginView();
});
