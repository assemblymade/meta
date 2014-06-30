/** @jsx React.DOM */

//= require constants

var TC = CONSTANTS.TEXT_COMPLETE;

var TextComplete = React.createClass({
  mixins: [React.addons.LinkedStateMixin],

  getInitialState: function() {
    return { inputValue: '' };
  },

  render: function() {
    return (
      <div role="form" className="form-inline">
        <div className="form-group">
          <label className="sr-only">{this.props.label}</label>
          <input type="text"
                 className={"form-control input-" + this.size()}
                 valueLink={this.linkState('inputValue')}
                 style={{width: this.props.width}}
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
      data: this.getDOMNode(),
      event: TC.EVENTS.DID_MOUNT
    });
  },

  handleClick: function(e) {
    Dispatcher.dispatch({
      action: TC.ACTIONS.ADD_TAG,
      data: { tag: this.state.inputValue, url: this.props.url },
      event: TC.EVENTS.TAG_ADDED + '-true'
    });

    this.setState({
      inputValue: ''
    });
  }
});
