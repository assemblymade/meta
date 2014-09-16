/** @jsx React.DOM */

(function() {
  var FormGroup = require('./form_group.js.jsx');
  var xhr = require('../xhr');

  var NewRepositoryPreview = React.createClass({
    getInitialState: function() {
      return {
        inputPreview: '',
        transform: this.props.transform || this.transform
      };
    },

    handleResponse: function(err, response) {
      if (err) {
        return console.error(err);
      }

      window.location = window.location;
    },

    render: function() {
      return (
        <form role="form" class="form">
          <FormGroup>
            <div className="input-group" style={{ width: '50%' }}>
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
                  Create
                </a>
                <a
                    href="javascript:"
                    className="btn btn-primary"
                    onClick={this.onClick(true)}
                    disabled={this.buttonState()}
                    data-toggle="tooltip">
                  Launchpad
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


    buttonState: function() {
      return this.state.inputPreview.length >= 2 ? false : true;
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
