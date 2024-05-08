// 크롬이 시작될 때마다 캐시 관리 함수 호출
chrome.runtime.onStartup.addListener(() => {
    manageCacheData();
    
});


// 탭이 속한 크롭창에 측면패널 열기
chrome.action.onClicked.addListener(function(tab) {
    chrome.sidePanel.open({ windowId: tab.windowId });
    chrome.storage.local.clear()
});

// 탭 URL 변경 감지
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
        chrome.runtime.sendMessage({type: "updatePanel", url: changeInfo.url});
    }
});

// 새 탭으로의 이동 감지
chrome.tabs.onActivated.addListener(activeInfo => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        chrome.runtime.sendMessage({type: "updatePanel", url: tab.url});
    });
});


chrome.storage.local.get(['expirationDate'], function(result) {
    const today = new Date();

    let expirationDate = result.expirationDate ? new Date(result.expirationDate) : null;

    if (!expirationDate || today.getDate() !== expirationDate.getDate()) {
        // 기준 일자가 저장되어 있지 않거나 오늘 날짜가 기존 기준 일자와 다르다면
        // 캐시 데이터를 모두 지우고 오늘 날짜를 새로운 기준 일자로 저장
        chrome.storage.local.clear(function() {
            chrome.storage.local.set({ 'expirationDate': today.toString() }, function() {
                console.log('All cache cleared and new expiration date set.');
            });
        });
    } else {
        console.log('Cache is up-to-date and valid.');
    }
});

