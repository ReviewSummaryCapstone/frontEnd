import { getNaverProps, getCoupangProps } from './domExtractor.js'
import {DOMAIN_LIST, API} from '../config.js'

let permit=false
let domain=null
let pathname=null

let domainTextId
let domainListId
let reviewButtonId
let donutLoading
let reviewProsId
let reviewProsTextId
let reviewConsId
let reviewConsTextId
let reviewOverallId
let reviewOverallTextId
let reviewErrorId
let reviewErrorTextId
let arrowId
let loginId
let getProfileId
let accessToken


document.addEventListener('DOMContentLoaded', function() {
  domainTextId = document.querySelector('.domainSection h2')
  domainListId = document.querySelector('.domainListArticle p')
  reviewButtonId = document.querySelector('.reviewSummaryButton')
  donutLoading = document.querySelector('.donut')
  reviewProsId = document.querySelector('#pros')
  reviewProsTextId = document.querySelector('#pros p')
  reviewConsId = document.querySelector('#cons')
  reviewConsTextId = document.querySelector('#cons p')
  reviewOverallId = document.querySelector('#overall')
  reviewOverallTextId = document.querySelector('#overall p')
  reviewErrorId = document.querySelector('#error')
  reviewErrorTextId = document.querySelector('#error p')
  arrowId = document.querySelector('#arrow')
  /*
  loginId = document.querySelector('#login')
  getProfileId = document.querySelector('#getProfile')

  loginId.addEventListener('click',()=>{
    chrome.identity.getAuthToken({interactive: true}, function(token) {
      console.log(token);
      accessToken=token
    });
  })


  getProfile.addEventListener('click', ()=>{
    fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        console.log(response)
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to retrieve user info');
        }
      })
      .then(userInfo => {
        console.log(userInfo); // 사용자 정보 출력
        // 여기서 사용자 정보를 활용한 로직을 추가할 수 있습니다.
      })
      .catch(error => {
        console.error('Error fetching user info:', error);
      });
  })
  */

  // 탭 변경에 따른 측면 패널 업데이트
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "updatePanel") {
      const urlString = message.url;
      if(urlString) {
        setDomain(urlString)
        changeCurrentDomainText()
        verifyCurrentDomain()
        changeReviewButtonText()
      }
    }
  });

  // 초기 측면패널 도메인 설명
  chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    const urlString = tabs[0].url;
    if (urlString) {
      setDomain(urlString)
      changeCurrentDomainText()
      verifyCurrentDomain()
      changeReviewButtonText()
    }
  });

  // 리뷰 요약 버튼
  reviewButtonId.addEventListener('click', function() {
    if(permit === true){
      setLoading(true)
      reviewProcess()
    }
  });

  // 허용 도메인 목록 여닫기
  arrowId.addEventListener('click', function() {
    this.style.transform = (this.style.transform === 'rotate(180deg)') ? 'rotate(0deg)' : 'rotate(180deg)';
    domainListId.style.display = (domainListId.style.display === 'none' ? 'block' : 'none')
  })
    
});

//
//
//
// 리뷰 요약 처리
async function reviewProcess(){
  // 버튼 클릭 시 "요약 중" 메시지 표시
  //const fullUrl = `${protocol}//${domain}${pathname}`;
  let apiUrl = API;
  let props
  
  // 접속 도메인에 따른 api 주소 결정
  try {
    switch (domain) {
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
    setLoading(false)
    changeReviewButtonText()
    changeReviewText('상품 페이지가 아닙니다.', true);
    //console.error('DOM 읽는 것에 에러 발생', error)
    return
  }
  console.log(props)
  const key = domain+'/'+JSON.stringify(props)
  //console.log('apiUrl',apiUrl,'props',props,'key',key)
    
  // 여기서부터 비동기 작업 (크롬 API 때문)
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
      //
      const fetchJSON = await fetchWithTimeout(apiUrl, props, 20000)
      console.log(fetchJSON)
      summaryData  = fetchJSON.result
      //
      setCachedData(key, summaryData)
    }
    setLoading(false);
    changeReviewButtonText();
    changeReviewText(summaryData, false);

  } catch (error) {
    setLoading(false)
    changeReviewButtonText()
    switch (error.message) {
      case '요청 시간 초과': {
        changeReviewText('잠시 후 다시 이용해 주세요.', true);
        break
      }
      case '네트워크 오류': {
        changeReviewText('네트워크 오류', true); // 다른 모든 에러 처리
        break
      }
    }
  }
}

//
//
//
function getCachedData(key) {
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

function setCachedData(key, data) {
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

function fetchWithTimeout(apiUrl, props,  timeout){
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      console.log('요청 시간 초과')
      reject(new Error('요청 시간 초과'));
    }, timeout);

    // 전송할 데이터
    console.log('서버에 전달되는 데이터',props)

    fetch(apiUrl,{
      method: 'POST', // 요청 메서드 설정
      headers: {
        'Content-Type': 'application/json' // 콘텐츠 타입 헤더 설정
      },
      body: JSON.stringify(props) // 바디에 JSON 데이터 첨부
    })
    .then(response => {
      clearTimeout(timer);
      if (!response.ok) {
        console.log('ㅅㅓㅂㅓ error')
        throw new Error('네트워크 오류');
      }
      return response.json();
    })
    .then(data => {
      console.log('ㅅㅓㅂㅓ ㅇㅡㅇㄷㅏㅂ?', data  )
      resolve(data);
    })
    .catch(error => {
      clearTimeout(timer);
      reject(error);
    });
  });
}

//
//
//
// 도메인 변수 설정
function setDomain(urlString){
  const url = new URL(urlString); // URL 객체 생성
  domain = url.hostname
  pathname = url.pathname
}

// 현재 도메인을 출력
function changeCurrentDomainText(){
  domainTextId.textContent = "현재 도메인: " + domain;
}

// 현재 도메인 검증
function verifyCurrentDomain(){
  if(DOMAIN_LIST.includes(domain)){
    permit=true;
  }
  else {
    permit=false;
  }
}

// 리뷰 요약 버튼 텍스트 변경
function changeReviewButtonText(){
  if(permit) reviewButtonId.textContent = '요약 하기'
  else reviewButtonId.textContent = '요약 불가'
}

function changeReviewText(data, error){
  if(error){
    reviewErrorId.style.display = 'block'
    reviewProsId.style.display = 'none'
    reviewConsId.style.display = 'none'
    reviewOverallId.style.display = 'none'
    reviewErrorTextId.textContent = data
  } else {
    reviewErrorId.style.display = 'none'
    reviewProsId.style.display = 'block'
    reviewConsId.style.display = 'block'
    reviewOverallId.style.display = 'block'
    let index = data.pros.indexOf(':')
    console.log(index)
    reviewProsTextId.textContent = data.pros.slice(index + 1).trim()
    index = data.cons.indexOf(':')
    reviewConsTextId.textContent = data.cons.slice(index + 1).trim()
    index = data.comprehensive.indexOf(':')
    reviewOverallTextId.textContent = data.comprehensive.slice(index + 1).trim()
  }
}


function setLoading(state){
  if(state){
    reviewButtonId.style.display = 'none'
    donutLoading.style.display = 'block'
  } else {
    reviewButtonId.style.display = 'block'
    donutLoading.style.display = 'none'
  }
}