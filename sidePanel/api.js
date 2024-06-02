export default  function fetchWithTimeout(apiUrl, props,  timeout){
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