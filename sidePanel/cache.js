export  function getCachedData(key) {
    return new Promise((resolve, reject) => {
            chrome.storage.local.get(key, result => {
                if (chrome.runtime.lastError) {
                    console.warn('스토리지 접근 오류:', chrome.runtime.lastError);
                    resolve();
                } else {
                    resolve(result);
                }
            });
        });
}

export  function setCachedData(key, data) {
    const cachedData = {
        data: data,
    };

    let object = { [key]: cachedData }; // 동적으로 키를 설정하기 위해 객체를 사용합니다.
    chrome.storage.local.set(object, function() {
        if (chrome.runtime.lastError) {
            console.warn('캐시 데이터 저장 오류:', chrome.runtime.lastError);
            // 에러 발생 시에도 resolve 호출
            //resolve();
        } else {
            console.log(key, '에 대한 캐시 데이터가 저장되었습니다:', data);
            //resolve();
        }
    });
}