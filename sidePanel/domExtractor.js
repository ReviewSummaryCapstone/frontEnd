export async function getCoupangProps() {
    function parsingLogic() {
        try {
            const link = document.head.querySelector('link[rel="canonical"]');
            const url = link.href
            const urlObject = new URL(url)
            const productNo = urlObject.pathname.split('/').at(-1)
            return {'productNo': productNo}
        } catch (error) {
            return null;
        }
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
                const checkoutMerchantNo = dataObject.product.A.channel.naverPaySellerNo
                //const checkoutMerchantNo = dataObject.smartStoreV2.channel.payReferenceKey
                console.log('찾은 데이터:', originProductNo, checkoutMerchantNo);
                return {
                    'originProductNo': originProductNo,
                    'checkoutMerchantNo': checkoutMerchantNo
                }
            } catch (error) {
                //console.error('JSON 파싱 오류:', error);
                return null
            }
        } else {
            console.log('첫 번째 스크립트 태그에 window.__PRELOADED_STATE__ 데이터가 없습니다.');
            return null
        }
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
        if (result === null) {
            throw new Error("상품 페이지가 아닙니다")
        }
        return result;
    } catch (error) {
        //console.error('Error getting HTML from the current tab:', error);
        return null;  // 에러 시 null 반환 또는 적절한 에러 처리
    }
}

async function executeParsingLogic(tabId, parsingLogic) {
    try {
        const results = await chrome.scripting.executeScript({
            target: {tabId: tabId},
            func: parsingLogic
        });
        if (results[0].result === null) {
            throw new Error("상품 페이지가 아닙니다")
        }
        return results[0].result; // 첫 번째 결과, 주 DOM에서의 결과
    } catch (error) {
        //console.error('Error extracting data:', error);
        return null;
    }
}