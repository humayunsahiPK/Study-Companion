const OFFSCREEN_DOCUMENT_PATH = "offscreen.html";

async function hasOffscreenDocument() {
  const contexts = await chrome.runtime.getContexts({
    contextTypes: ["OFFSCREEN_DOCUMENT"],
  });
  return contexts.length > 0;
}

async function closeOffscreenDocumentIfExists() {
  if (await hasOffscreenDocument()) {
    await chrome.offscreen.closeDocument();
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "start-recording") {
    (async () => {
      try {
        const tab = await chrome.tabs
          .query({ active: true, currentWindow: true })
          .then((tabs) => tabs[0]);

        if (!tab) {
          sendResponse({ success: false, error: "No active tab found." });
          return;
        }

        const streamId = await chrome.tabCapture.getMediaStreamId({
          targetTabId: tab.id,
        });

        await closeOffscreenDocumentIfExists();

        // streamId is passed straight in the URL instead of via a
        // follow-up message, since it expires fast and the offscreen
        // doc's listener isn't guaranteed to be ready in time otherwise
        await chrome.offscreen.createDocument({
          url: `${OFFSCREEN_DOCUMENT_PATH}?streamId=${encodeURIComponent(streamId)}`,
          reasons: ["USER_MEDIA"],
          justification: "Recording tab audio for lecture transcription",
        });

        sendResponse({ success: true });
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true;
  }

  if (message.action === "stop-recording") {
    chrome.runtime.sendMessage({ action: "offscreen-stop-recording" });
    sendResponse({ success: true });
    return true;
  }

  // offscreen docs can't call chrome.storage themselves, so they relay
  // through us instead
  if (message.action === "offscreen-storage-set") {
    chrome.storage.local.set(message.data).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.action === "offscreen-storage-get") {
    chrome.storage.local.get(message.keys).then((result) => {
      sendResponse({ success: true, data: result });
    });
    return true;
  }
});
