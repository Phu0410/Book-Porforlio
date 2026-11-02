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
let mobileFlipInProgress = false;

function showMobilePage(index) {
    mobilePageIndex = Math.max(0, Math.min(index, mobileFaces.length - 1));

    mobileFaces.forEach(face => face.classList.remove('mobile-current', 'mobile-flip-outgoing', 'mobile-flip-underlay'));
    pages.forEach(page => page.classList.remove('mobile-active', 'mobile-flip-underlay-parent'));

    const currentFace = mobileFaces[mobilePageIndex];
    currentFace.classList.add('mobile-current');
    const parentPage = currentFace.closest('.book-page.page-right');
    if (parentPage) parentPage.classList.add('mobile-active');

    // chatgpt design: keep mobile Previous visible but temporarily disabled.
    mobilePrev.hidden = false;
    mobilePrev.disabled = true;
    mobilePrev.setAttribute('aria-disabled', 'true');
    mobileNext.hidden = mobilePageIndex === mobileFaces.length - 1;
    mobileCount.textContent = `${mobilePageIndex + 1} / ${mobileFaces.length}`;
    currentFace.scrollTop = 0;
}

// design by chatgpt: animate a single visible mobile page as a two-sided book leaf.
function cloneMobileFlipFace(face, sideClass) {
    const clone = face.cloneNode(true);
    clone.classList.add('mobile-flip-face', sideClass);
    clone.classList.remove('mobile-current', 'mobile-active', 'mobile-flip-outgoing', 'mobile-flip-underlay', 'mobile-flip-incoming', 'mobile-flip-underlay-parent', 'turn');
    clone.removeAttribute('id');
    clone.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
    clone.setAttribute('aria-hidden', 'true');
    clone.inert = true;
    clone.scrollTop = face.scrollTop;
    return clone;
}

function turnMobilePage(index, direction) {
    const nextIndex = Math.max(0, Math.min(index, mobileFaces.length - 1));
    if (direction === 'prev' || nextIndex === mobilePageIndex || mobileFlipInProgress) return;

    const currentFace = mobileFaces[mobilePageIndex];
    const nextFace = mobileFaces[nextIndex];
    // Put the next real page under the turning sheet so its content is visible during the flip.
    currentFace.classList.add('mobile-flip-outgoing');
    nextFace.classList.add('mobile-current', 'mobile-flip-underlay');
    const nextParent = nextFace.closest('.book-page.page-right');
    if (nextParent){
        nextParent.classList.add('mobile-active', 'mobile-flip-underlay-parent');
    }

    const book = document.querySelector('.book');
    const sheet = document.createElement('div');
    sheet.className = `mobile-flip-sheet mobile-flip-${direction}`;
    const emptyFace = document.createElement('div');
    emptyFace.className = 'mobile-flip-face mobile-flip-back mobile-flip-empty';
    emptyFace.setAttribute('aria-hidden', 'true');

    sheet.append(cloneMobileFlipFace(currentFace, 'mobile-flip-front'), emptyFace);

    mobileFlipInProgress = true;
    mobilePrev.disabled = true;
    mobileNext.disabled = true;
    wrapper.classList.add('mobile-flip-running');
    book.appendChild(sheet);

    sheet.addEventListener('animationend', event => {
        if (event.target !== sheet) return;
        showMobilePage(nextIndex);
        sheet.remove();
        wrapper.classList.remove('mobile-flip-running');
        mobileFlipInProgress = false;
        mobilePrev.disabled = true;
        mobilePrev.setAttribute('aria-disabled', 'true');
        mobileNext.disabled = false;
    });
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

mobilePrev.onclick = () => {};
mobileNext.onclick = () => turnMobilePage(mobilePageIndex + 1, 'next');
mobileQuery.addEventListener('change', syncMobileLayout);
syncMobileLayout();

pageTurnBtn.forEach((el, index) => {
    el.onclick = () => {
        if (mobileQuery.matches) {
            if (el.classList.contains('back')) return;
            turnMobilePage(mobilePageIndex + 1, 'next');
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
