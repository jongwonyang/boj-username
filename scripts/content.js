const idLinks = document.querySelectorAll('a[href^="/user/"]');

if (idLinks) {
  chrome.storage.local.get(["namelist"], function (result) {
    const namelist = new Map(Object.entries(result.namelist || {}));
    idLinks.forEach((idLink) => {
      const id = idLink.textContent;
      if (namelist.has(id)) {
        idLink.textContent += `(${namelist.get(id)})`;
      }
    });
  });
}
