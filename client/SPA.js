function waitForElm(node, selector) {
  return new Promise((resolve) => {
    if (node.querySelector(selector)) {
      return resolve(node.querySelector(selector));
    }

    const observer = new MutationObserver((mutations) => {
      if (node.querySelector(selector)) {
        observer.disconnect();
        resolve(node.querySelector(selector));
      }
    });

    observer.observe(node, {
      childList: true,
      subtree: true,
    });
  });
}

function blobToBase64(blob) {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

function parseAndDeleteExternalLinks(node) {
  if (!node.href.includes("plan-dynamique.irigo.fr")) {
    node.href = "/";
    node.target = "";
  }
}

function my_print(src) {
  let rawPDFBase64 = fetch(src).then((response) => {
    response.blob().then((blob) => {
      blobToBase64(blob).then((base64) => {
        return base64;
      });
    });
  });
  console.log(rawPDFBase64);
  console.log("my_print");
  if (typeof Kiosk !== "undefined") {
    Kiosk.Session.close({
      information:
        "Nouvelle session utilisateur / Démarrage du scénario de paiement",
    });

    //console.log(src);
    let printingSources = Kiosk.DocumentPrinting.sourcesList;
    Kiosk.DocumentPrinting.addEventListener("rawPdfPrint", onRawPdfPrint);

    Kiosk.DocumentPrinting.printRawPdf({
      raw: RawPDFBase64.split(",")[1],
      //raw: base64.split(",")[1],
      //raw: "JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmoKPDwKICAvVHlwZSAvUGFnZXMKICAvTWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0KPj4KZW5kb2JqCgozIDAgb2JqCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFyZW50IDIgMCBSCiAgL1Jlc291cmNlcyA8PAogICAgL0ZvbnQgPDwKICAgICAgL0YxIDQgMCBSIAogICAgPj4KICA+PgogIC9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKCjQgMCBvYmoKPDwKICAvVHlwZSAvRm9udAogIC9TdWJ0eXBlIC9UeXBlMQogIC9CYXNlRm9udCAvVGltZXMtUm9tYW4KPj4KZW5kb2JqCgo1IDAgb2JqICAlIHBhZ2UgY29udGVudAo8PAogIC9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCjcwIDUwIFRECi9GMSAxMiBUZgooSGVsbG8sIHdvcmxkISkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDEwIDAwMDAwIG4gCjAwMDAwMDAwNzkgMDAwMDAgbiAKMDAwMDAwMDE3MyAwMDAwMCBuIAowMDAwMDAwMzAxIDAwMDAwIG4gCjAwMDAwMDAzODAgMDAwMDAgbiAKdHJhaWxlcgo8PAogIC9TaXplIDYKICAvUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDkyCiUlRU9G",
      source: printingSources[0],
    });
    //});

    function onRawPdfPrint(e) {
      console.log(e.data.dataType);
      switch (e.data.dataType) {
        case "RawPdfPrinted":
          console.log("Document imprimé");
          break;
        case "RawPdfPrintError":
          console.error(e.data.code + ": " + e.data.description);
          break;
      }
    }
    Kiosk.DocumentPrinting.removeEventListener("rawPdfPrint", onRawPdfPrint);
  } else if (window.print) {
    window.frames["pdf-embed"].print();
  }
  //alert(src);
}

/*document.addEventListener("click", (e) => {
  if (e.target.matches(".lc-line-header .lc-tool-timetable")) {
    e.target.setAttribute("role", "");
    e.stopPropagation();
    e.preventDefault();
    return false;
    alert("AH! ");
  }
});*/
function observe() {
  waitForElm(document, ".lc-line-header").then(function (node) {
    link =
      "/pdf/s3fs-public/fichiers/documents/Ligne-" +
      node.querySelectorAll(".lc-line img")[0].alt +
      ".pdf#toolbar=0&navpanes=0&scrollbar=0";
    elem = node.querySelectorAll(".lc-tool-timetable")[0];
    elem.onclick = function (e) {
      document.querySelector(".lc-map").remove();
      document.querySelector(".lc-content").remove();
      PDFnode = document.createElement("embed");
      PDFnode.src = link;
      PDFnode.style = "height:1020px;";
      PDFnode.name = "pdf-embed";
      document.querySelector(".lc-header-column").after(PDFnode);

      // ensure #lcmap .lc-header-column img:nth-child(4)
      // has hardcoded {    max-height: 95px;    position: absolute;    right: 35px;  } style
      document.querySelector(
        "#lcmap .lc-header-column img:nth-child(4)",
      ).style = "max-height: 95px;position: absolute;right: 35px;";

      var sheet = document.createElement("style");
      sheet.innerHTML =
        "a.proxified_tab {color: #fff; margin-left: 100px;text-decoration: none}";
      document.head.appendChild(sheet);

      var planText = document.querySelector("#lcmap > header > span");
      planText.remove();

      var a = document.createElement("a");
      // add svg prit icon :
      const placeholder = document.createElement("div");
      placeholder.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="currentColor" class="bi bi-printer" viewBox="0 0 16 16"><path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1"/><path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1"/></svg>';
      const node = placeholder.firstElementChild;

      a.appendChild(node);
      //var linkText = document.createTextNode(" Imprimer");
      var printText = document.createElement("span");
      printText.innerHTML = "Imprimer";

      a.appendChild(printText);
      //a.style = "color: #fff; margin-left: 100px;text-decoration: none";

      a.href = "javascript:my_print('" + link + "')";
      a.classList.add("proxified_tab");

      var a2 = document.createElement("a");
      var backSpan = document.createElement("span");
      var linkText = document.createTextNode("Retour au Plan dynamique");
      backSpan.appendChild(linkText);
      a2.appendChild(backSpan);
      a2.href = "/";
      a2.classList.add("proxified_tab");
      document.querySelector("#lcmap > header > a").after(a2);

      document.querySelector("#lcmap > header > a").after(a);

      e.preventDefault();
      e.stopPropagation();
      observe();
    };
  });
}

observe();
/*const config = { attributes: true, childList: true, subtree: true };
const callback = (mutationList, observer) => {
  for (const mutation of mutationList) {
    console.log(mutation);
  }
};
const observer = new MutationObserver(callback);

waitForElm(document, ".lc-content").then(function (node) {
  observer.observe(node, config);
});*/

waitForElm(document, "img.lc-images").then(function (node) {
  document.querySelectorAll("a").forEach((e) => {
    //alert(e.href);
    parseAndDeleteExternalLinks(e);
  });

  // link to pdf seems to be encoded here :
  // <img src="/assets/images/lines/42.svg" alt="42">
});
