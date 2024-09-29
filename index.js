function skipNavigation() {
  var content = document.getElementById('home');
  content.tabIndex = -1;
  content.focus();
}

function convertRemToPixels(rem) {    
  return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

const headerHeight = document.getElementById('header').getBoundingClientRect().height;

let sections = [];
let sectionHeadings = [];

function generateSections() {
  sections = [];
  sectionHeadings = [];
  [...document.getElementsByTagName('section')].forEach((section) => {
    sections.push(section.offsetTop + section.offsetHeight - headerHeight);
  });
  
  [...document.getElementById('header-desktop-navigation').children].forEach((heading, index) => {
    sectionHeadings.push({
      offset: index > 0 ? sectionHeadings[index - 1].offset + (sectionHeadings[index - 1].width * 1.75) + convertRemToPixels(1.125) + (heading.getBoundingClientRect().width - convertRemToPixels(1.125)) / 8
      : ((heading.getBoundingClientRect().width - convertRemToPixels(1.125)) / 4),
      width: (heading.getBoundingClientRect().width - convertRemToPixels(1.125)) / 2,
    })
  });
}

function calculateHeadingBar() {
  const currentSections = sections.filter((item) => item >= this.window.scrollY).length > 0 ? sections.filter((item) => item > this.window.scrollY + headerHeight) : [sections[sections.length - 1]];
  const currentSection = sectionHeadings[sections.indexOf(currentSections[0])];
  this.document.body.style.setProperty('--current-heading-offset', `${currentSection.offset}px`);
  this.document.body.style.setProperty('--current-heading-width', `${currentSection.width}px`);
  const mobileItem = [...document.getElementById('header-mobile-nav').children][sections.indexOf(currentSections[0])];
  [...document.getElementById('header-mobile-nav').children].filter((item2) => item2 !== mobileItem && item2.classList.contains('active')).map((item2) => item2.classList.remove('active'));
  mobileItem.classList.add('active');
}

window.addEventListener('scroll', function() {
  this.document.body.style.setProperty('--current-scroll', window.scrollY);
  this.document.body.style.setProperty('--has-scroll', window.scrollY > 10 ? 1 : 0);
  this.document.body.classList.toggle('has-scroll', window.scrollY > 10);
  calculateHeadingBar();
});

window.addEventListener('resize', () => {
  generateSections();
  this.document.body.style.setProperty('--current-scroll', window.scrollY);
  calculateHeadingBar();
});

[...document.getElementById('header-mobile-nav').children].forEach((item, index, array) => {
  item.addEventListener('click', () => {
    array.filter((item2) => item2 !== item && item2.classList.contains('active')).map((item2) => item2.classList.remove('active'));
    item.classList.add('active');
    document.getElementById('header-mobile-navigation').classList.add('closed');
  })
});

function openMobileNav() {
  document.getElementById('header-mobile-navigation').classList.remove('closed');
}

function closeMobileMenu() {
  document.getElementById('header-mobile-navigation').classList.add('closed');
}

generateSections();
calculateHeadingBar();