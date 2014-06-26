/** @jsx React.DOM */

//= require constants

var TypeaheadSelect = React.createClass({
  render: function() {
    return (
      <select name={this.props.name}
              id={this.props.id}
              data-placeholder={this.props.dataPlaceholder}
              className={this.props.className}
              multiple={this.props.multiple || false}>
        {this.options()}
      </select>
    );
  },

  options: function() {
    return _.map(this.props.options, function(option) {
      return (
        <option value={option}>{'@' + option}</option>
      );
    });
  },

  componentDidMount: function() {
    Dispatcher.dispatch({
      action: CONSTANTS.TYPEAHEAD_SELECT.ACTIONS.SETUP,
      data: this.getDOMNode(),
      event: CONSTANTS.TYPEAHEAD_SELECT.EVENTS.DID_MOUNT
    });
  }
});
