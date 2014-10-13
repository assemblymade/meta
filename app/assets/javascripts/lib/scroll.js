$(function() {
  $('body').delegate('[data-scroll]', 'click', function() {
    var $target = $($(this).attr('data-target'));

    $('html, body').animate({ scrollTop: $target.offset().top }, 500);
    setTimeout(function() { $target.focus(); }, 500);

    return false;
  });
});
