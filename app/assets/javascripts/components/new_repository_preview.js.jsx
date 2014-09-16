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

    getInitialState: function() {
      return {
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
        return console.error(err);
      }

      window.location = window.location;
    },

    onChange: function(e) {
      var value = e.target.value;

      this.setState({
        inputPreview: this.state.transform(value)
      });
    },

    onClick: function(launchpad) {
      return function(e) {
        e.preventDefault();

        var data = {
          launchpad: launchpad,
          name: this.state.inputPreview
        };

        window.xhr.post(this.props.path, data, this.handleResponse);
      }.bind(this);
    },

    render: function() {
      return (
        <form role="form" className="form">
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
                    onClick={this.onClick(false)}
                    disabled={this.buttonState()}>
                  Create empty repo
                </a>
                <a  id="create-with-launchpad"
                    href="javascript:"
                    className="btn btn-primary"
                    onClick={this.onClick(true)}
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
