/** @jsx React.DOM */

(function() {
  var NumberInput = React.createClass({
    componentWillMount: function() {
      this.setState({
        amount: this.props.startingAmount,
        editable: this.props.alwaysEditable
      });
    },

    componentDidMount: function() {
      this.listenForChanges(this.refs.inputField && this.refs.inputField.getDOMNode());
    },

    componentDidUpdate: function() {
      this.componentDidMount();
    },

    render: function() {
      if (this.state.editable) {
        return this.editable();
      }

      return this.uneditable();
    },

    editable: function() {
      return (
        <div className="input-group">
          <input name={this.props.name} ref="inputField" type="number" className="form-control" min="0" step="0.1" defaultValue={this.state.amount}/>
          <span className="input-group-addon">%</span>
        </div>
      );
    },

    uneditable: function() {
      var self = this;

      $('#edit-contract-' + this.props.user.username).click(function(e) {
        $(self.props.confirmButton).css('visibility', 'hidden');
        $(this).text() === 'Edit' ? $(this).text('Cancel') : $(this).text('Edit');
        self.setState({ editable: !self.state.editable });
      });

      return (<span><strong>{this.props.startingAmount + '%'}</strong> tip when coins are minted</span>);
    },

    listenForChanges: function(node) {
      $(node).on('change keydown', this.handleChange);
    },

    handleChange: function(e) {
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

  if (typeof module !== 'undefined') {
    module.exports = NumberInput;
  }

  window.NumberInput = NumberInput;
})();
