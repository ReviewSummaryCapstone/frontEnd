import DomainManager from "./domainManager.js";
import ReviewUIManager from "./reviewUIManager.js";
import addDomainUpdateListener from "./domainUpdateListener.js";
import addDOMEventListener from "./domEventListener.js";


function initializeApp() {
  console.log("initializeApp 시작");
  DomainManager.init();
  ReviewUIManager.init();
  addDomainUpdateListener();
  addDOMEventListener();

}

document.addEventListener('DOMContentLoaded', initializeApp)
