export async function getCoupangProps() {
    function parsingLogic() {
        const link = document.head.querySelector('link[rel="canonical"]');
        const url = link.href
        const urlObject = new URL(url)
        const productNo = urlObject.pathname.split('/').at(-1)
        
        
        console.log('찾은 데이터:', productNo);
        return {'productNo': productNo}
    }
    
    const tab = await getActiveTab();
    return await getHTMLProps(tab.id, parsingLogic)
}

export async function getNaverProps() {
    function parsingLogic() {
        const firstScriptTag = document.body.querySelector(':scope > script') // 첫 번째 스크립트 태그를 가져옵니다.
        if (firstScriptTag && firstScriptTag.textContent.includes('window.__PRELOADED_STATE__')) {
            // 스크립트 내용에서 JSON 형태의 데이터만 추출합니다.
            const startIndex = firstScriptTag.textContent.indexOf('{');
            const endIndex = firstScriptTag.textContent.lastIndexOf('}') + 1;
            const jsonData = firstScriptTag.textContent.substring(startIndex, endIndex);
        
            try {
                // JSON 문자열을 객체로 변환합니다.
                const dataObject = JSON.parse(jsonData);
                const originProductNo = dataObject.product.A.productNo
                const checkoutMerchantNo = dataObject.smartStoreV2.channel.payReferenceKey
                console.log('찾은 데이터:', originProductNo, checkoutMerchantNo);
                return {
                    'originProductNo': originProductNo,
                    'checkoutMerchantNo': checkoutMerchantNo
                }
            } catch (error) {
                console.error('JSON 파싱 오류:', error);
                return null
            }
        } else {
            console.log('첫 번째 스크립트 태그에 window.__PRELOADED_STATE__ 데이터가 없습니다.');
            return null
        }
        
        
        
        // 페이지가 완전히 로드된 후에 window.__PRELOADED_STATE__에 접근
        /*
        try {
            const preloadedState = window.__PRELOADED_STATE__
            let t = document.script
            console.log(window)
            if (!preloadedState || !preloadedState.product || !preloadedState.product.A || !preloadedState.smartStoreV2 || !preloadedState.smartStoreV2.channel) {
                console.log('필요한 정보가 누락되었습니다.');
                return null;
            }
            
            const originProductNo = preloadedState.product.A.productNo
            const checkoutMerchantNo = preloadedState.smartStoreV2.channel.payReferenceKey
            return {
                'originProductNo': originProductNo,
                'checkoutMerchantNo': checkoutMerchantNo
            }
        } catch (error) {
            console.error('preloaded 상태를 찾을 수 없습니다.', error)
            return null
        }
        */
    }
    
    const tab = await getActiveTab();
    return await getHTMLProps(tab.id, parsingLogic)
}

function getActiveTab() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError));
            } else {
                resolve(tabs[0]);
            }
        });
    });
}

export async function getHTMLProps(tabId, parsingLogic) {
    try {
        const result = await executeParsingLogic(tabId, parsingLogic);
        return result;
    } catch (error) {
        console.error('Error getting HTML from the current tab:', error);
        return null;  // 에러 시 null 반환 또는 적절한 에러 처리
    }
}

async function executeParsingLogic(tabId, parsingLogic) {
    try {
        const results = await chrome.scripting.executeScript({
            target: {tabId: tabId},
            func: parsingLogic
        });
        return results[0].result; // 첫 번째 결과, 주 DOM에서의 결과
    } catch (error) {
        console.error('Error extracting data:', error);
        return null;
    }
    
    /*
    return new Promise((resolve, reject) => {
        chrome.scripting.executeScript({
            target: {tabId: tabId},
            function: parsingLogic
        }, (injectionResults) => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError));
            } else {
                resolve(injectionResults.map(result => result.result));
            }
        });
    });
    */
}