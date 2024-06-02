// 탭이 속한 크롭창에 측면패널 열기
chrome.action.onClicked.addListener(function(tab) {
    chrome.sidePanel.open({ windowId: tab.windowId });
    //chrome.storage.local.clear()
});

function manageCacheData() {
    chrome.storage.local.get('expirationDate', function(result) {
        const today = new Date();
        console.log(result)
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
}

manageCacheData();