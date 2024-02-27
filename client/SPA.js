function waitForElm(node, selector) {
  return new Promise((resolve) => {
    /*if (node.querySelector(selector)) {
      return resolve(node.querySelector(selector));
    }*/

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
    console.log("Kiosk print");
    //console.log(src);
    let printingSources = Kiosk.DocumentPrinting.sourcesList;
    Kiosk.DocumentPrinting.addEventListener("rawPdfPrint", onRawPdfPrint);
    fetch(src).then((response) => {
      response.blob().then((blob) => {
        blobToBase64(blob).then((base64) => {
          console.log(base64.split(",")[1]);
          Kiosk.DocumentPrinting.printRawPdf({
            raw: base64.split(",")[1],
            //raw: base64.split(",")[1],
            //raw: "JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmoKPDwKICAvVHlwZSAvUGFnZXMKICAvTWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0KPj4KZW5kb2JqCgozIDAgb2JqCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFyZW50IDIgMCBSCiAgL1Jlc291cmNlcyA8PAogICAgL0ZvbnQgPDwKICAgICAgL0YxIDQgMCBSIAogICAgPj4KICA+PgogIC9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKCjQgMCBvYmoKPDwKICAvVHlwZSAvRm9udAogIC9TdWJ0eXBlIC9UeXBlMQogIC9CYXNlRm9udCAvVGltZXMtUm9tYW4KPj4KZW5kb2JqCgo1IDAgb2JqICAlIHBhZ2UgY29udGVudAo8PAogIC9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCjcwIDUwIFRECi9GMSAxMiBUZgooSGVsbG8sIHdvcmxkISkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDEwIDAwMDAwIG4gCjAwMDAwMDAwNzkgMDAwMDAgbiAKMDAwMDAwMDE3MyAwMDAwMCBuIAowMDAwMDAwMzAxIDAwMDAwIG4gCjAwMDAwMDAzODAgMDAwMDAgbiAKdHJhaWxlcgo8PAogIC9TaXplIDYKICAvUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDkyCiUlRU9G",
            source: printingSources[0],
          });
        });
      });
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
function observePrintButton() {
  waitForElm(document, "[data-pdf]").then(function (node) {
    node.onclick = function (e) {
      my_print(
        node
          .getAttribute("data-pdf")
          .replaceAll("https://borne-irigo.dataccessor.com/", "/"),
      );
    };

    //a.href = "javascript:my_print('" + link + "')";

    //e.preventDefault();
    //e.stopPropagation();
    observePrintButton();
  });
}

function observeEmailInput() {
  waitForElm(document, "[type=email]").then(function (node) {
    node.onclick = function (e) {
      Kiosk.OnscreenKbd.show("email");
    };

    //a.href = "javascript:my_print('" + link + "')";

    //e.preventDefault();
    //e.stopPropagation();
    observeEmailInput();
  });
}

observePrintButton();
observeEmailInput();
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
