var ContractStore = require('../stores/contract_store');
var C = require('../constants').CONTRACT;
var Dispatcher = require('../dispatcher');

var ContractInput = React.createClass({
  componentWillMount: function() {
    this.setState({
      amount: this.props.startingAmount,
      editable: this.props.alwaysEditable
    });
  },

  componentDidMount: function() {
    ContractStore.addChangeListener(this.contractsChange);

    if (this.props.user) {
      Dispatcher.dispatch({
        action: C.ACTIONS.ADD_CONTRACT,
        data: { id: this.props.user.id, amount: this.props.startingAmount }
      });
    }
  },

  // Hack to prevent looping when component mounts
  contractsChange: function() {},

  render: function() {
    return this.state.editable ? this.editable() : this.uneditable();
  },

  editable: function() {
    return (
      <div className="input-group">
        <input name={this.props.name}
            ref="inputField"
            type="number"
            className="form-control"
            min="0"
            max={ContractStore.getAvailablePercentage(this.props.startingAmount)}
            step="0.01"
            value={this.state.amount}
            onChange={this.onChange} />
        <span className="input-group-addon">%</span>
      </div>
    );
  },

  uneditable: function() {
    var self = this;

    $('#edit-contract-' + this.props.user.username).click(function(e) {
      $(self.props.confirmButton).css('visibility', 'hidden');
      $(this).text() === 'Edit' ? $(this).text('Cancel') : $(this).text('Edit'); // jshint ignore:line
      self.setState({ editable: !self.state.editable });
    });

    return (
      <span>
        <strong>{this.props.startingAmount + '%'}</strong> tip when coins are minted
      </span>
    );
  },

  onChange: function(e) {
    this.setState({ amount: e.target.value });

    var confirmLink = $(this.props.confirmButton);

    if (!_.isEmpty(confirmLink)) {
      var node = $(this.refs.inputField.getDOMNode());

      if (node && node.val() !== this.props.startingAmount) {
        confirmLink.css('visibility', 'visible');
        confirmLink.off('click');
        confirmLink.on('click', { node: node, self: this }, this.confirm);
      } else {
        confirmLink.css('visibility', 'hidden');
        confirmLink.off('click');
      }
    }
  },

  confirm: function(e) {
    var node = e.data.node;
    var self = e.data.self;
    var obj = {
      contract: {
        amount: node.val(),
        user: this.props.user.id
      }
    };

    _.debounce($.ajax({
      url: self.props.updatePath,
      method: 'PATCH',
      data: obj,
      success: self.handleSuccess,
      error: self.handleError
    }), 300);
  },

  handleSuccess: function(data) {
    window.location.reload(true);
  },

  handleError: function(jqxhr, status) {
    console.error(status);
  }
});

module.exports = window.ContractInput = ContractInput;
