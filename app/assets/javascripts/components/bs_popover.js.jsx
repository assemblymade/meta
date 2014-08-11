/** @jsx React.DOM */

(function() {

  // Patch Bootstrap popover to take a React component instead of a
  // plain HTML string
  $.extend($.fn.popover.Constructor.DEFAULTS, {react: false});
  var oldSetContent = $.fn.popover.Constructor.prototype.setContent;
  $.fn.popover.Constructor.prototype.setContent = function() {
      if (!this.options.react) {
          return oldSetContent.call(this);
      }

      var $tip = this.tip();
      var title = this.getTitle();
      var content = this.getContent();

      $tip.removeClass('fade top bottom left right in');

      // If we've already rendered, there's no need to render again
      if (!$tip.find('.popover-content').html()) {
          // Render title, if any
          var $title = $tip.find('.popover-title');
          if (title) {
              React.renderComponent(title, $title[0]);
          } else {
              $title.hide();
          }

          React.renderComponent(
              content,
              $tip.find('.popover-content')[0]
          );
      }
  };

  var BsPopover = React.createClass({
      componentDidMount: function() {
          var $el = $(this.getDOMNode());

          $el.popover({
              react: true,
              title: this.props.title,
              content: this.props.content,
              trigger: '',  // Don't toggle on click automatically
              placement: this.props.placement !== null ?
                  this.props.placement : undefined
          });
          if (this.props.visible) {
              $el.popover('show');
          }
      },

      componentDidUpdate: function(prevProps, prevState) {
          var $el = $(this.getDOMNode());
          if (prevProps.visible !== this.props.visible) {
              $el.popover(this.props.visible ? 'show' : 'hide');
          }
      },

      componentWillUnmount: function() {
          // Clean up before destroying: this isn't strictly
          // necessary, but it prevents memory leaks
          var $el = $(this.getDOMNode());
          var popover = $el.data('bs.popover');
          var $tip = popover.tip();
          React.unmountComponentAtNode(
              $tip.find('.popover-title')[0]
          );
          React.unmountComponentAtNode(
              $tip.find('.popover-content')[0]
          );
          $(this.getDOMNode()).popover('destroy');
      },

      render: function() {
          return this.props.children;
      }
  });

  if (typeof module !== 'undefined') {
    module.exports = BsPopover;
  }

  window.BsPopover = BsPopover;
})();
