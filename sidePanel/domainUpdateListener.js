// 탭 변경에 따른 측면 패널 업데이트
import DomainManager from "./domainManager.js";

export default function addDomainUpdateListener() {

    // 탭 URL 변경 감지
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        const urlString = tab.url;
        test(urlString);
    });

    // 새 탭으로의 이동 감지
    chrome.tabs.onActivated.addListener(activeInfo => {
        chrome.tabs.get(activeInfo.tabId, (tab) => {
            const urlString = tab.url;
            test(urlString);
        });
    });

    
    // 초기 측면패널 도메인 설명
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        const urlString = tabs[0].url;
        test(urlString);
    });
}

function test(urlString) {
    if (urlString) DomainManager.setDomain(urlString);
}