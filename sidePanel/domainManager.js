import {DOMAIN_LIST} from "../config.js";

class Domain {
    constructor() {
        this.domainImageId = null;
        this.reviewButtonId = null;
        this.domain = null;
        this.pathname = null;
        this.permit = false;
    }
    
    getPermit() {
        return this.permit
    }
    
    getDomain() {
        return this.domain
    }
    
    init() {
        this.domainImageId = document.querySelector('#domain')
        this.reviewButtonId = document.querySelector('.reviewSummaryButton')
    }
    
    async setDomain(urlString) {
        const url = new URL(urlString);
        this.domain = url.hostname;
        this.pathname = url.pathname;
        await this._changeCurrentDomainImage();
        this._setPermitAboutDomain();
        this._changeReviewButtonText();
    }
    
    async _changeCurrentDomainImage() {
        let imgPath;
        
        switch (this.domain) {
            case 'brand.naver.com':
            case 'smartstore.naver.com':
                imgPath = 'naver.svg'
                break
            case 'www.coupang.com':
                imgPath = 'coupang.svg'
                break
            default:
                imgPath = null;
        }
        
        if (!imgPath) {
            this.domainImageId.textContent = ""
            return
        }
        
        try {
            const reponse = await fetch(`../assests/${imgPath}`)
            if (!reponse.ok) {
                throw new Error('Domain 이미지 경로 에러!');
            }
            this.domainImageId.innerHTML = await reponse.text()
        } catch (error) {
            console.error('Domain 이미지 경로 에러!')
        }
        
    }
    
    _setPermitAboutDomain() {
        this.permit = DOMAIN_LIST.includes(this.domain);
    }
    
    _changeReviewButtonText() {
        if(this.permit) this.reviewButtonId.textContent = '요약하기'
        else this.reviewButtonId.textContent = '요약불가'
    }
}

export default new Domain();