console.log("Content script injected");

function addSwitchModeButton() {
  console.log("Adding switch mode button");

  const currentURL = window.location.href;
  console.log("Current URL:", currentURL);

  const editorRegex = /localhost:4502\/editor\.html\/|10.29.24.20:4502\/editor\.html\//;
  if (editorRegex.test(currentURL)) {
    console.log("URL matches the editor regex");

    const button = document.createElement('button');
    button.innerText = 'Switch Mode';
    button.id = 'switch-mode-button';
    button.className = 'switch-mode-button';

    button.addEventListener('click', () => {
      const newURL = currentURL.replace('/editor.html/', '/') + "?wcmmode=disabled";
      window.open(newURL, '_blank');
      console.log("New URL opened: " + newURL);
    });

    document.body.appendChild(button);
    console.log("Button added to the page");
  } else {
    console.log("URL does not match the editor regex");
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded event fired");
    addSwitchModeButton();
  });
} else {
  console.log("Document already loaded");
  addSwitchModeButton();
}