class ReviewUIManager {
    constructor() {
        this.reviewButtonId = null;
        this.donutLoading = null;
        this.reviewProsId = null;
        this.reviewProsTextId = null;
        this.reviewConsId = null;
        this.reviewConsTextId = null;
        this.reviewOverallId = null;
        this.reviewOverallTextId = null;
        this.reviewErrorId = null;
        this.reviewErrorTextId = null;
    }
    
    init() {
        this.reviewButtonId = document.querySelector('.reviewSummaryButton')
        this.donutLoading = document.querySelector('.donut')
        this.reviewProsId = document.querySelector('#pros')
        this.reviewProsTextId = document.querySelector('#pros p')
        this.reviewConsId = document.querySelector('#cons')
        this.reviewConsTextId = document.querySelector('#cons p')
        this.reviewOverallId = document.querySelector('#overall')
        this.reviewOverallTextId = document.querySelector('#overall p')
        this.reviewErrorId = document.querySelector('#error')
        this.reviewErrorTextId = document.querySelector('#error p')
    }
    
    changeReviewText(data, error) {
        if (error) {
            this.reviewErrorId.style.display = 'block';
            this.reviewProsId.style.display = 'none';
            this.reviewConsId.style.display = 'none';
            this.reviewOverallId.style.display = 'none';
            this.reviewErrorTextId.textContent = data;
        } else {
            this.reviewErrorId.style.display = 'none';
            this.reviewProsId.style.display = 'block';
            this.reviewConsId.style.display = 'block';
            this.reviewOverallId.style.display = 'block';
            let index = data.pros.indexOf(':');
            console.log(index);
            this.reviewProsTextId.textContent = data.pros.slice(index + 1).trim();
            index = data.cons.indexOf(':');
            this.reviewConsTextId.textContent = data.cons.slice(index + 1).trim();
            index = data.comprehensive.indexOf(':');
            this.reviewOverallTextId.textContent = data.comprehensive.slice(index + 1).trim();
        }
    }
    
    setLoading(state) {
        if (state) {
            this.reviewButtonId.style.display = 'none';
            this.donutLoading.style.display = 'block';
        } else {
            this.reviewButtonId.style.display = 'block';
            this.donutLoading.style.display = 'none';
        }
    }
}

export default new ReviewUIManager()