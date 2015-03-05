

(function() {
  var CreateBounty = require('./create_bounty.js.jsx');
  var Icon = require('./ui/icon.js.jsx');

  var CreateBountyButton = React.createClass({
    propTypes: {
      classes: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.array
      ]),
      label: React.PropTypes.string,
      product: React.PropTypes.object,
      url: React.PropTypes.string,
      maxOffer: React.PropTypes.number,
      averageBounty: React.PropTypes.number,
      coinsMinted: React.PropTypes.number,
      profitLastMonth: React.PropTypes.number,
      steps: React.PropTypes.array
    },

    componentDidUpdate: function() {
      // workaround for triggering the modal from inside a dropdown menu:
      // Without this hack, the modal renders inside the dropdown, and so
      // never shows up. To trigger the modal from a dropdown, just pass an
      // external element's id as the renderInto prop

      if (this.modal && this.state.createBountyShown) {
        return $(this.modal.getDOMNode()).modal({ show: true });
      }

      if (this.props.renderInto) {
        this.modal = React.render(
          <CreateBounty {...this.props} onHidden={this.handleCreateBountyHidden} />,
          document.getElementById(this.props.renderInto)
        )
      }
    },

    getDefaultProps: function() {
      return {
        label: 'Create a bounty',
        classes: 'btn btn-default btn-sm'
      }
    },

    getInitialState: function() {
      return {
        createBountyShown: this.props.createBountyShown
      }
    },

    renderCreateBounty: function() {
      if (this.props.renderInto) {
        return;
      }

      if (this.state.createBountyShown) {
        return <CreateBounty {...this.props} onHidden={this.handleCreateBountyHidden} />;
      }
    },

    render: function() {
      // FIXME: (pletcher) Checking `renderInto` to see about rendering the icon
      // is no bueno. There's gotta be a better way to handle that.

      return (
        <span>
          <a className={this.props.classes} onClick={this.handleClick}>
            {this.props.renderInto ? [<Icon icon="trophy" />, <span>&nbsp;</span>] : null}
            {this.props.label}
          </a>
          {this.renderCreateBounty()}
        </span>
      )
    },

    handleCreateBountyHidden: function() {
      this.setState({ createBountyShown: false })
    },

    handleClick: function() {
      this.setState({ createBountyShown: true })
    }
  })

  if (typeof module !== 'undefined') {
    module.exports = CreateBountyButton
  }

  window.CreateBountyButton = CreateBountyButton
})();
