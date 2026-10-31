const pageTurnBtn = document.querySelectorAll('.nextprev-btn');
const pages = document.querySelectorAll('.book-page.page-right');
const pageLeft = document.querySelector('.book-page.page-left');
const contactMeBtn = document.querySelector('.btn.contact-me');
const backProfileBtn = document.querySelector('.back-profile');
const wrapper = document.querySelector('.wrapper');
const mobileControls = document.querySelector('.mobile-page-controls');
const mobilePrev = document.querySelector('.mobile-page-prev');
const mobileNext = document.querySelector('.mobile-page-next');
const mobileCount = document.querySelector('.mobile-page-count');
const mobileQuery = window.matchMedia('(max-width: 1000px)');
const projectImageBox = document.querySelector('.portfolio-box .img-box');

// design by chatgpt
function toggleProjectImageZoom() {
    const isZoomed = projectImageBox.classList.toggle('is-zoomed');
    projectImageBox.setAttribute('aria-pressed', String(isZoomed));
}

projectImageBox.addEventListener('click', () => {
    if (mobileQuery.matches) toggleProjectImageZoom();
});
projectImageBox.addEventListener('keydown', event => {
    if (mobileQuery.matches && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        toggleProjectImageZoom();
    }
});
const mobileFaces = [
    pageLeft,
    ...Array.from(pages).flatMap(page => [
        page.querySelector('.page-front'),
        page.querySelector('.page-back'),
    ]),
];
let mobilePageIndex = 0;

function showMobilePage(index) {
    mobilePageIndex = Math.max(0, Math.min(index, mobileFaces.length - 1));

    mobileFaces.forEach(face => face.classList.remove('mobile-current'));
    pages.forEach(page => page.classList.remove('mobile-active'));

    const currentFace = mobileFaces[mobilePageIndex];
    currentFace.classList.add('mobile-current');
    const parentPage = currentFace.closest('.book-page.page-right');
    if (parentPage) parentPage.classList.add('mobile-active');

    mobilePrev.hidden = mobilePageIndex === 0;
    mobileNext.hidden = mobilePageIndex === mobileFaces.length - 1;
    mobileCount.textContent = `${mobilePageIndex + 1} / ${mobileFaces.length}`;
    currentFace.scrollTop = 0;
}

function syncMobileLayout() {
    const isMobile = mobileQuery.matches;
    wrapper.classList.toggle('mobile-view', isMobile);
    mobileControls.setAttribute('aria-hidden', String(!isMobile));
    if (isMobile) {
        showMobilePage(mobilePageIndex);
    } else {
        projectImageBox.classList.remove('is-zoomed');
        projectImageBox.setAttribute('aria-pressed', 'false');
        mobileFaces.forEach(face => face.classList.remove('mobile-current'));
        pages.forEach(page => page.classList.remove('mobile-active'));
    }
}

mobilePrev.onclick = () => showMobilePage(mobilePageIndex - 1);
mobileNext.onclick = () => showMobilePage(mobilePageIndex + 1);
mobileQuery.addEventListener('change', syncMobileLayout);
syncMobileLayout();

pageTurnBtn.forEach((el, index) => {
    el.onclick = () => {
        if (mobileQuery.matches) {
            showMobilePage(mobilePageIndex + (el.classList.contains('back') ? -1 : 1));
            return;
        }

        const pageTurnId = el.getAttribute('data-page');
        const pageTurn = document.getElementById(pageTurnId);

        if (pageTurn.classList.contains('turn')) {
            pageTurn.classList.remove('turn');
            setTimeout(() => {
                pageTurn.style.zIndex = 2 - index;
            }, 500);
        } else {
        projectImageBox.classList.remove('is-zoomed');
        projectImageBox.setAttribute('aria-pressed', 'false');
            pageTurn.classList.add('turn');
            setTimeout(() => {
                pageTurn.style.zIndex = 2 + index;
            }, 500);
        }
    };
});

// Contact button opens the contact page on mobile and keeps the book animation on desktop.
contactMeBtn.onclick = () => {
    if (mobileQuery.matches) {
        showMobilePage(mobileFaces.length - 1);
        return;
    }

    pages.forEach((page, index) => {
        setTimeout(() => {
            page.classList.add('turn');
            setTimeout(() => {
                page.style.zIndex = 20 + index;
            }, 500);
        }, (index + 1) * 200 + 100);
    });
};

let totalPages = pages.length;
let pageNumber = 0;

function reverseIndex() {
    pageNumber--;
    if (pageNumber < 0) pageNumber = totalPages - 1;
}

// Back to profile button.
backProfileBtn.onclick = () => {
    if (mobileQuery.matches) {
        showMobilePage(0);
        return;
    }

    pages.forEach((_, index) => {
        setTimeout(() => {
            reverseIndex();
            pages[pageNumber].classList.remove('turn');
            setTimeout(() => {
                reverseIndex();
                pages[pageNumber].style.zIndex = 10 + index;
            }, 500);
        }, (index + 1) * 200 + 100);
    });
};

// Opening animation (cover right animation).
const coverRight = document.querySelector('.cover.cover-right');
setTimeout(() => {
    coverRight.classList.add('turn');
}, 2100);
setTimeout(() => {
    coverRight.style.zIndex = -1;
}, 2800);

pages.forEach((_, index) => {
    setTimeout(() => {
        reverseIndex();
        pages[pageNumber].classList.remove('turn');
        setTimeout(() => {
            reverseIndex();
            pages[pageNumber].style.zIndex = 10 + index;
        }, 500);
    }, (index + 1) * 200 + 2100);
});
