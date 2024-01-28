chrome.runtime.onMessage.addListener(function (request, _, sendResponse) {
  fetch(request.url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request.body),
  })
    .then(
      (response) => response.text(),
      (error) => ({ error, message: error?.message })
    )
    .then((response) => sendResponse(response));
  return true;
});
