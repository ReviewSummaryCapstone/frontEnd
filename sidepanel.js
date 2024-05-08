permit=false
domain=null
pathname=null
fullDomain=null
arrowState=false


domainList=[
  "www.smartstore.naver.com",
  "smartstore.naver.com",
  "www.coupang.com"
]

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
  setCachedData('https://smartstore.naver.com/jangsinmall/products/8713155253', {pros:'장점: 장점내용', cons:'단점: 단점내용', comprensive:'종합: 종합내용'})

  // 탭 변경에 따른 측면 패널 업데이트
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "updatePanel") {
      const urlString = message.url;
      setDomain(urlString)
      changeCurrentDomainText()
      verifyCurrentDomain()
      changeReviewButtonText()
    }
  });

  // 초기 측면패널 도메인 설명
  chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    const urlString = tabs[0].url;
    setDomain(urlString)
    changeCurrentDomainText()
    verifyCurrentDomain()
    changeReviewButtonText()
  });

  reviewButtonId.addEventListener('click', function() {
    if(permit === true){
      setLoading(true)
      reviewProcess()
    }
  });

  arrowId.addEventListener('click', function() {
    this.style.transform = (this.style.transform === 'rotate(180deg)') ? 'rotate(0deg)' : 'rotate(180deg)';
    console.log(domainListId.style.display)
    domainListId.style.display = (domainListId.style.display === 'none' ? 'block' : 'none')
  })
    
});

// 도메인 변수 설정
function setDomain(urlString){
  let url = new URL(urlString); // URL 객체 생성
  domain = url.hostname
  pathname = url.pathname
  protocol = url.protocol
  console.log(url,domain,pathname)
}

// 현재 도메인을 출력
function changeCurrentDomainText(){
  domainTextId.textContent = "현재 도메인: " + domain;
}

// 현재 도메인 검증
function verifyCurrentDomain(){
  if(domainList.includes(domain)){
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
    reviewProsTextId.textContent = data.pros.slice(3)
    reviewConsTextId.textContent = data.cons.slice(3)
    reviewOverallTextId.textContent = data.comprensive.slice(3)
  }
}

// 리뷰 요약 처리
async function reviewProcess(){
  // 버튼 클릭 시 "요약 중" 메시지 표시
  const fullUrl = `${protocol}//${domain}${pathname}`;
    
  // 여기서부터 비동기 작업 (크롬 API 때문)
  try {
    const result = await getStorageData(fullUrl);
    const cachedData = result[fullUrl];
    
    if (cachedData) {
      console.log("캐시 있음", cachedData);
      setLoading(false);
      changeReviewButtonText();
      changeReviewText(cachedData.data, false);
    } else {
      console.log("캐시 없음", fullUrl);
      fetchServer(fullUrl);
    }
  } catch (error) {
      console.error("스토리지 접근 오류", error);
      fetchServer(fullUrl);
  }
  // getCachedDataServerData(fullUrl)
}

function getCachedDataServerData(fullUrl) {
  try {
    const result = await getStorageData(fullUrl);
    const cachedData = result[fullUrl];
    
    if (cachedData) {
      console.log("캐시 있음", cachedData);
      setLoading(false);
      changeReviewButtonText();
      changeReviewText(cachedData.data, false);
    } else {
      console.log("캐시 없음", fullUrl);
      fetchServer(fullUrl);
    }
  } catch (error) {
    // 접근 오류이면 그냥 바로 요청 ㄱㄱ
    console.error("스토리지 접근 오류", error);
    fetchServer(fullUrl);
  }
  
  /*
  function test(result) {
    const cachedData = result[fullUrl];
    if(cachedData){
      console.log("캐시 있음", cachedData)
      setLoading(false)
      changeReviewButtonText()
      changeReviewText(cachedData.data, false)
    } else {
      console.log("캐시 없음", fullUrl)
      fetchServer(fullUrl)
    }
  }
  chrome.storage.local.get(fullUrl, test);
  */
}

function getCachedData(key) {
  return new Promise((resolve, reject) => {
      chrome.storage.local.get(key, result => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result);
        }
      });
    });
}

function setCachedData(fullUrl, data) {
  const cachedData = {
    data: data,
  };
  let key = { [fullUrl]: cachedData }; // 동적으로 키를 설정하기 위해 객체를 사용합니다.
  chrome.storage.local.set(key, function() {
    console.log('Cached data saved for', fullUrl, data);
  });
}

function fetchWithTimeout(apiUrl, fullUrl,  timeout){
  // 전송할 데이터
  const data = {
    url: fullUrl
  };
  
  console.log('서버에 전달되는 데이',data)
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Request timed out'));
    }, timeout);

    fetch(apiUrl,{
      method: 'POST', // 요청 메서드 설정
      headers: {
        'Content-Type': 'application/json' // 콘텐츠 타입 헤더 설정
      },
      body: JSON.stringify(data) // 바디에 JSON 데이터 첨부
    })
    .then(response => {
      clearTimeout(timer);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      resolve(data);
    })
    .catch(error => {
      clearTimeout(timer);
      reject(error);
    });
  });
}

function fetchServer(fullUrl){
  const apiUrl = 'http://43.203.207.57:8080/summary/smartstore';
  fetchWithTimeout(apiUrl, fullUrl, 100000)
  .then(data=>{
    setLoading(false)
    changeReviewButtonText()
    changeReviewText(data.result, false)
    setCachedData(fullUrl, data.result)
  })
  .catch(error=>{
    setLoading(false)
    changeReviewButtonText()
    if (error.message === 'Request timed out') {
      changeReviewText('요청 시간 초과', true);
    } else {
      changeReviewText('네트워크 오류', true); // 다른 모든 에러 처리
    }
  })
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


async function getCurrentTabHTML() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.scripting.executeScript({
      target: {tabId: tabs[0].id},
      function: getPageHTML
    }, (injectionResults) => {
      for (const frameResult of injectionResults)
        console.log('Frame Title: ' + frameResult.result);
    });
  });
}

function extractCoupangProps() {
  const link = document.querySelector('link[rel="canonical"]');
  console.log(link.href)
}