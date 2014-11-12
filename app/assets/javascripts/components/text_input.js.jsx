/** @jsx React.DOM */

(function() {
  var CONSTANTS = require('../constants');
  var Dispatcher = require('../dispatcher');
  var TC = CONSTANTS.TEXT_COMPLETE;

  var TextInput = React.createClass({
    mixins: [React.addons.LinkedStateMixin],

    active: function() {
      return this.state.inputValue.length >= 2 ? '' : 'disabled';
    },

    getInitialState: function() {
      return {
        inputValue: '',
        transform: (this.props.transform || this.transform)
      };
    },

    handleClick: function(e) {
      Dispatcher.dispatch({
        action: TC.ACTIONS.ADD_TAG,
        data: {
          tag: this.state.transform(this.state.inputValue),
          url: this.props.url
        },
      });

      this.setState({
        inputValue: '',
        hide: true
      });
    },

    keyDown: function(e) {
      if (e.key === 'Enter') {
        e.stopPropagation();
        e.preventDefault();

        this.handleClick(e);
      }
    },

    render: function() {
      return (
        <div role="form" className="form-inline">
          <div className={"form-group input-group-" + this.size()}>
            <label className="sr-only">{this.props.label}</label>
            <input type="text"
                   className={"form-control input-" + this.size()}
                   valueLink={this.linkState('inputValue')}
                   style={{ width: this.props.width }}
                   onKeyDown={this.keyDown}
                   placeholder={this.props.label}
            />
          </div>
          <a className={"btn btn-default btn-" + this.size() + ' ' + this.active()}
                onClick={this.handleClick}>
            {this.props.prompt}
          </a>
        </div>
      );
    },

    size: function(prefix) {
      switch (this.props.size) {
      case 'small':
        return 'sm';
      case 'medium':
        return 'md';
      case 'large':
        return 'lg';
      default:
        return 'md';
      }
    },

    transform: function(text) {
      return text.replace(/[^\w-]+/g, '-').toLowerCase()
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = TextInput;
  }

  window.TextInput = TextInput;
})();
