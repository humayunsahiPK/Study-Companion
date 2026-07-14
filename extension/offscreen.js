const API_BASE_URL = "http://localhost:8000";

let mediaRecorder = null;
let recordedChunks = [];

// offscreen docs can't touch chrome.storage directly, so we relay
// through background.js instead
async function storageSet(data) {
  await chrome.runtime.sendMessage({ action: "offscreen-storage-set", data });
}

async function storageGet(keys) {
  const response = await chrome.runtime.sendMessage({
    action: "offscreen-storage-get",
    keys,
  });
  return response?.data || {};
}

const params = new URLSearchParams(window.location.search);
const streamId = params.get("streamId");

if (streamId) {
  startRecording(streamId);
} else {
  storageSet({
    isRecording: false,
    lastRecordingStatus: "error",
    lastRecordingMessage: "No stream ID provided to offscreen document.",
  });
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "offscreen-stop-recording") {
    stopRecording();
  }
});

async function startRecording(streamId) {
  recordedChunks = [];

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        mandatory: {
          chromeMediaSource: "tab",
          chromeMediaSourceId: streamId,
        },
      },
    });

    // capturing the tab mutes it by default, so route it back to the
    // speakers so the user can still hear the lecture live
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(audioContext.destination);

    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = handleRecordingStop;
    mediaRecorder.onerror = async (event) => {
      await storageSet({
        lastRecordingStatus: "error",
        lastRecordingMessage: `Recording error: ${event.error?.message || "unknown"}`,
      });
    };

    mediaRecorder.start();
  } catch (err) {
    await storageSet({
      isRecording: false,
      lastRecordingStatus: "error",
      lastRecordingMessage: `Could not start recording: ${err.message}`,
    });
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach((track) => track.stop());
  }
}

async function handleRecordingStop() {
  const blob = new Blob(recordedChunks, { type: "audio/webm" });

  const { access_token: token } = await storageGet("access_token");

  if (!token) {
    await storageSet({
      lastRecordingStatus: "error",
      lastRecordingMessage: "Not signed in.",
    });
    return;
  }

  try {
    const formData = new FormData();
    formData.append("file", blob, `recording-${Date.now()}.webm`);

    const response = await fetch(`${API_BASE_URL}/lectures/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    await storageSet({
      lastRecordingStatus: "success",
      lastRecordingMessage: "Uploaded! Processing in Study Companion.",
    });
  } catch (err) {
    await storageSet({
      lastRecordingStatus: "error",
      lastRecordingMessage: err.message,
    });
  }
}
