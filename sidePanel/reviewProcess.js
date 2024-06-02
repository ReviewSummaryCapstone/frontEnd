import {API} from "../config.js";
import DomainManager from "./domainManager.js";
import ReviewUIManager from "./reviewUIManager.js";
import {getCachedData, setCachedData} from "./cache.js";
import fetchWithTimeout from "./api.js";
import {getCoupangProps, getNaverProps} from "./domExtractor.js";


export default  async function reviewProcess(){
    if (!DomainManager.getPermit()) {
        return null
    }
    
    ReviewUIManager.setLoading(true)
    
    
    
    // 버튼 클릭 시 "요약 중" 메시지 표시
    let apiUrl = API;
    let props
    
    // 접속 도메인에 따른 api 주소 결정
    try {
        switch (DomainManager.getDomain()) {
            case "brand.naver.com":
            case "smartstore.naver.com": {
                apiUrl+='smartstore'
                props = await getNaverProps()
                break
            }
            case "www.coupang.com": {
                apiUrl+='coupang'
                props = await getCoupangProps()
                break
            }
        }
        if (props === null) {
            throw new Error("상품 페이지가 아닙니다")
        }
    } catch (error) {
        console.log(DomainManager, error)
        ReviewUIManager.setLoading(false);
        ReviewUIManager.changeReviewText('상품 페이지가 아닙니다.', true);
        //console.error('DOM 읽는 것에 에러 발생', error)
        return
    }
    
    const key = DomainManager.getDomain()+'/'+JSON.stringify(props)
        

    try {
        //
        const result = await getCachedData(key);
        const cachedData = result[key];
        let summaryData
        if (cachedData) {
            console.log("캐시 있음", cachedData);
            summaryData = cachedData.data
        } else {
            console.log("캐시 없음", key);
            const fetchJSON = await fetchWithTimeout(apiUrl, props, 20000)
            summaryData  = fetchJSON.result
            setCachedData(key, summaryData)
        }
        ReviewUIManager.setLoading(false);
        ReviewUIManager.changeReviewText(summaryData, false);

    } catch (error) {
        ReviewUIManager.setLoading(false)
        switch (error.message) {
            case '요청 시간 초과': {
                ReviewUIManager.changeReviewText('잠시 후 다시 이용해 주세요.', true);
                break
            }
            case '네트워크 오류': {
                ReviewUIManager.changeReviewText('네트워크 오류', true); // 다른 모든 에러 처리
                break
            }
        }
    }
}
