// travismasingale.info — R&D page behavior
// Filter buttons toggle visibility on .project-card by data-category.

(function () {
  var buttons = document.querySelectorAll('.filter-button');
  var cards = document.querySelectorAll('.project-card');
  if (!buttons.length || !cards.length) return;

  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', onFilterClick);
  }

  function onFilterClick(e) {
    var filter = e.currentTarget.getAttribute('data-filter') || 'all';

    for (var i = 0; i < buttons.length; i++) {
      buttons[i].classList.toggle('is-active', buttons[i] === e.currentTarget);
    }

    for (var j = 0; j < cards.length; j++) {
      var cats = (cards[j].getAttribute('data-category') || '').split(/\s+/);
      var match = filter === 'all' || cats.indexOf(filter) !== -1;
      cards[j].hidden = !match;
    }
  }
})();
