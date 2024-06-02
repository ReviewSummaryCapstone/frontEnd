// 탭 변경에 따른 측면 패널 업데이트
import DomainManager from "./domainManager.js";

export default function addDomainUpdateListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === "updatePanel") {
            const urlString = message.url;
            if(urlString) {
                DomainManager.setDomain(urlString)
            }
        }
    });
    
    // 초기 측면패널 도메인 설명
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        const urlString = tabs[0].url;
        if (urlString) {
            DomainManager.setDomain(urlString)
        }
    });
}

