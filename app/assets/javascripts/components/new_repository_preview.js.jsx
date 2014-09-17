/** @jsx React.DOM */

(function() {
  var FormGroup = require('./form_group.js.jsx');
  var xhr = require('../xhr');

  var NewRepositoryPreview = React.createClass({
    buttonState: function() {
      return this.state.inputPreview.length >= 2 ? false : true;
    },

    componentDidMount: function() {
      $('#create-with-launchpad').tooltip({
        container: 'body'
      });
    },

    componentWillUnmount: function() {
      $('#create-with-launchpad').tooltip('destroy');
    },

    createEmptyRepo: function(e) {
      e.preventDefault();

      var data = {
        launchpad: false,
        name: this.state.inputPreview
      };

      window.xhr.post(this.props.path, data, this.handleResponse);
    },

    createWithLaunchpad: function(e) {
      e.preventDefault();

      var data = {
        launchpad: true,
        name: this.state.inputPreview
      };

      window.xhr.post(this.props.path, data, this.handleResponse);
    },

    getInitialState: function() {
      return {
        errorDisplay: 'none',
        infoDisplay: 'none',
        inputPreview: '',
        transform: this.props.transform || this.transform
      };
    },

    handleHide: function() {
      this.setState({
        popoverShown: false
      });
    },

    handleResponse: function(err, response) {
      if (err) {
        this.setState({
          errorDisplay: 'inline-block'
        });

        return console.error(err);
      }

      this.setState({
        infoDisplay: 'inline-block'
      });
    },

    hideError: function(e) {
      e.preventDefault();

      this.setState({
        errorDisplay: 'none'
      });
    },

    hideInfo: function(e) {
      e.preventDefault();

      this.setState({
        infoDisplay: 'none'
      });
    },

    onChange: function(e) {
      var value = e.target.value;

      this.setState({
        inputPreview: this.state.transform(value)
      });
    },

    render: function() {
      return (
        <form role="form" className="form">
          <div className="alert alert-info" role="alert" style={{ display: this.state.infoDisplay }}>
            <button type="button" className="close" onClick={this.hideInfo} style={{ 'padding-left': '10px' }}>
              <span aria-hidden="true">&times;</span>
              <span className="sr-only">Close</span>
            </button>
            We've started creating your repo, and you should receive an email when it's complete.
          </div>

          <div className="alert alert-danger" role="alert" style={{ display: this.state.errorDisplay }}>
            <button type="button" className="close" onClick={this.hideError} style={{ 'padding-left': '10px' }}>
              <span aria-hidden="true">&times;</span>
              <span className="sr-only">Close</span>
            </button>
            Something went wrong, and we're working on a fix. Please try again in a little while.
          </div>

          <FormGroup>
            <div className="input-group" style={{ width: '70%' }}>
              <input type="text"
                  className="form-control"
                  value={this.state.inputPreview}
                  placeholder={this.props.placeholder}
                  onChange={this.onChange} />
              <span className="input-group-btn">
                <a
                    href="javascript:"
                    className="btn btn-primary"
                    onClick={this.createEmptyRepo}
                    disabled={this.buttonState()}>
                  Create empty repo
                </a>
                <a  id="create-with-launchpad"
                    href="javascript:"
                    className="btn btn-primary"
                    onClick={this.createWithLaunchpad}
                    disabled={this.buttonState()}
                    data-toggle="tooltip"
                    title="Let Assembly generate a landing page automatically using GitHub Pages.">
                  Create with landing page
                </a>
              </span>
            </div>
            <p className="text-muted omega" style={{ 'margin-top': '5px', 'margin-left': '1px' }}>
              Preview: <strong>{this.props.addonText + this.state.inputPreview}</strong>
            </p>
          </FormGroup>
        </form>
      );
    },

    transform: function(text) {
      return text.replace(/[^\w-\.]+/g, '-').toLowerCase();
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = NewRepositoryPreview;
  }

  window.NewRepositoryPreview = NewRepositoryPreview;
})();
