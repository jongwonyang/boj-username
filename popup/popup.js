document.addEventListener("DOMContentLoaded", function () {
  const idInput = document.getElementById("id");
  const nameInput = document.getElementById("name");
  const addButton = document.getElementById("addButton");
  const fileInput = document.getElementById("fileInput");
  const uploadButton = document.getElementById("uploadButton");
  const exportButton = document.getElementById("exportButton");
  const list = document.getElementById("list");

  function mapToObject(map) {
    const obj = {};
    map.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  }

  function objectToMap(obj) {
    const map = new Map();
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        map.set(key, obj[key]);
      }
    }
    return map;
  }

  function refreshList() {
    chrome.storage.local.get(["namelist"], function (result) {
      const namelist = objectToMap(result.namelist || {});
      list.innerHTML = "";
      namelist.forEach((name, id) => {
        const li = document.createElement("li");
        li.textContent = `${id}: ${name}`;
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "삭제";
        deleteButton.className = "deleteButton";
        deleteButton.addEventListener("click", function () {
          deleteItem(id);
        });
        li.appendChild(deleteButton);
        list.appendChild(li);
      });
    });
  }

  function deleteItem(id) {
    chrome.storage.local.get(["namelist"], function (result) {
      const namelist = objectToMap(result.namelist || {});
      if (namelist.has(id)) {
        namelist.delete(id);
        chrome.storage.local.set(
          { namelist: mapToObject(namelist) },
          function () {
            refreshList();
          }
        );
      }
    });
  }

  addButton.addEventListener("click", function () {
    const id = idInput.value.trim();
    const name = nameInput.value.trim();
    if (id && name) {
      chrome.storage.local.get(["namelist"], function (result) {
        const namelist = objectToMap(result.namelist || {});
        namelist.set(id, name);
        chrome.storage.local.set(
          { namelist: mapToObject(namelist) },
          function () {
            idInput.value = "";
            nameInput.value = "";
            refreshList();
          }
        );
      });
    }
  });

  uploadButton.addEventListener("click", function () {
    const file = fileInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        try {
          const json = JSON.parse(event.target.result);
          const newEntries = objectToMap(json);
          chrome.storage.local.get(["namelist"], function (result) {
            const namelist = objectToMap(result.namelist || {});
            newEntries.forEach((name, id) => {
              namelist.set(id, name);
            });
            chrome.storage.local.set(
              { namelist: mapToObject(namelist) },
              function () {
                refreshList();
              }
            );
          });
        } catch (error) {
          console.error("JSON 파일 형식이 올바르지 않습니다.", error);
        }
      };
      reader.readAsText(file);
    }
  });

  exportButton.addEventListener("click", function () {
    chrome.storage.local.get(["namelist"], function (result) {
      const namelist = result.namelist || {};
      const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(namelist));
      const downloadAnchorNode = document.createElement("a");
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "namelist.json");
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    });
  });

  refreshList();
});
