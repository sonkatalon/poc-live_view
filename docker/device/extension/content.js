document.addEventListener("click", (event) => {
  chrome.runtime.sendMessage({
    url: "http://nextjs:3000/relay/click",
    body: { target: event.target.outerHTML },
  });
});
