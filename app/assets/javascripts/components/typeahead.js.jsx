var CONSTANTS = require('../constants');

var TC = CONSTANTS.TEXT_COMPLETE;

var Typeahead = React.createClass({
  mixins: [React.addons.LinkedStateMixin],

  getInitialState: function() {
    return { inputValue: '', transform: (this.props.transform || this.transform) };
  },

  render: function() {
    return (
      <div role="form" className="form-inline">
        <div className="form-group">
          <label className="sr-only">{this.props.label}</label>
          <input type="text"
                 className={"form-control input-" + this.size()}
                 valueLink={this.linkState('inputValue')}
                 style={{width: this.props.width, 'padding-left': '5px'}}
          />
        </div>
        <button type="button"
                className={"btn btn-default btn-" + this.size() + ' ' + this.active()}
                onClick={this.handleClick}>
          {this.props.prompt}
        </button>
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
    }
  },

  active: function() {
    return this.state.inputValue.length >= 2 ? '' : 'disabled';
  },

  componentDidMount: function() {
    Dispatcher.dispatch({
      action: TC.ACTIONS.SETUP,
      data: this.getDOMNode()
    });
  },

  handleClick: function(e) {
    Dispatcher.dispatch({
      action: TC.ACTIONS.ADD_TAG,
      data: { tag: this.state.transform(this.state.inputValue), url: this.props.url }
    });

    this.setState({
      inputValue: ''
    });
  },

  transform: function(text) {
    return text.replace(/[^\w-]+/g, '-').toLowerCase()
  }
});

module.exports = window.Typeahead = Typeahead;
