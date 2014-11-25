/** @jsx React.DOM */

var CONSTANTS = window.CONSTANTS;
var ButtonStore = require('../stores/toggle_button_store');

(function() {
  var B = CONSTANTS.TOGGLE_BUTTON;

  var ToggleButton = React.createClass({
    propTypes: {
      text: React.PropTypes.object.isRequired,
      classes: React.PropTypes.object.isRequired,
      href: React.PropTypes.object.isRequired,
      icon: React.PropTypes.object
    },

    buttonText: function() {
      return this.props.text[this.state.bool];
    },

    icon: function() {
      if(this.props.icon) {
        var iconClasses = ['icon', 'icon-left', 'icon-' + this.props.icon[this.state.bool]].join(' ');
        return <span className={iconClasses}></span>;
      }
    },

    classes: function() {
      return this.props.classes[this.state.bool];
    },

    getInitialState: function() {
      return {
        bool: !!this.props.bool
      };
    },

    onClick: function(e) {
      e.preventDefault();

      Dispatcher.dispatch({
        action: B.ACTIONS.CLICK,
        data: this.props.href[this.state.bool]
      });

      // For now, optimistically changing the button's state
      // is probably fine. We might want to add error handling
      // in at some point along the lines of FormGroup
      this.setState({
        bool: !this.state.bool
      });
    },

    render: function() {
      return (
        <a className={this.classes()} onClick={this.onClick} href="#">
          {this.icon()}
          {this.buttonText()}
        </a>
      );
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = ToggleButton;
  }

  window.ToggleButton = ToggleButton;
})();
