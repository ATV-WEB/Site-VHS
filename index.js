function skipNavigation() {
  var content = document.getElementById('home');
  content.tabIndex = -1;
  content.focus();
}

window.addEventListener('scroll', function() {
  this.document.body.style.setProperty('--has-scroll', window.scrollY > 10 ? 1 : 0);
  this.document.body.classList.toggle('has-scroll', window.scrollY > 10);
});