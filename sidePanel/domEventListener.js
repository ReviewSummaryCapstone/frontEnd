import reviewProcess from "./reviewProcess.js";

export default  function addDOMEventListener() {
    // 허용 도메인 목록 여닫기
    const arrowId = document.querySelector('#arrow');
    arrowId.addEventListener('click', function() {
        const domainListId = document.querySelector('.domainListArticle > div');
        this.style.transform = (this.style.transform === 'rotate(180deg)') ? 'rotate(0deg)' : 'rotate(180deg)';
        domainListId.style.display = (domainListId.style.display === 'grid' ? 'none' : 'grid');
    });

    // 리뷰 요약 버튼
    const reviewButtonId = document.querySelector('.reviewSummaryButton');
    reviewButtonId.addEventListener('click', function() {
        reviewProcess();
    });
}