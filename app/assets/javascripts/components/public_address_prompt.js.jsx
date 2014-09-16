/** @jsx React.DOM */


(function() {
  var CONSTANTS = require('../constants');
  var D = CONSTANTS.NOTIFICATION_PREFERENCES_DROPDOWN;
  var Dispatcher = require('../dispatcher');
  var Lightbox = require('./lightbox.js.jsx');

  var PublicAddressPrompt = React.createClass({
    componentDidMount: function() {
      $(this.getDOMNode()).modal({
        show: true
      });
    },

    getInitialState: function() {
      return {
        publicAddress: null
      };
    },

    handleChange: function(e) {
      this.setState({
        publicAddress: e.target.value
      });
    },

    handleSubmit: function(e) {
      e.preventDefault();

      Dispatcher.dispatch({
        action: D.ACTIONS.UPDATE_SELECTED,
        data: {
          preference: 'follow',
          path: this.props.path,
          redirectTo: this.props.redirectTo,
          publicAddress: this.state.publicAddress
        }
      });
    },

    render: function() {
      return (
        <Lightbox title="Enter your public address" size="modal-md">
          <form role="form">
            <div className="modal-body">
              <p>
                If you have a public Bitcoin address where you'd like to receive your 10
                Assembly Assets coins, please enter it below.
              </p>
              <p>
                Otherwise, leave this form blank and we'll create
                a public address and associated private key for you.
              </p>
              <div className="form-group">
                <label className="form-label">Public address</label>
                <input
                    autofocus="autofocus"
                    className="form-control"
                    id="public_address"
                    type="text"
                    value={this.state.publicAddress}
                    onChange={this.handleChange} />
              </div>
            </div>
            <div className="modal-footer form-actions">
              <a className="btn btn-primary" onClick={this.handleSubmit}>Follow</a>
            </div>
          </form>
        </Lightbox>
      );
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = PublicAddressPrompt;
  }

  window.PublicAddressPrompt = PublicAddressPrompt;
})();
