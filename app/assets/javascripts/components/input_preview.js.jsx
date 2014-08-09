/** @jsx React.DOM */

var FormGroup = require('./form_group.js.jsx');

(function() {
  var InputPreview = React.createClass({
    getInitialState: function() {
      return {
        inputPreview: '',
        transform: this.props.transform || this.transform
      };
    },

    render: function() {
      return (
        <FormGroup>
          <div className="input-group" style={{ width: '35%' }}>
            <input type="text"
                name={this.props.inputName}
                className="form-control"
                value={this.state.inputPreview}
                placeholder={this.props.placeholder}
                onChange={this.onChange} />
            <span className={"input-group-btn"}>
              <button type="submit" onSubmit={this.onSubmit} className="btn btn-primary" disabled={this.buttonState()}>{this.props.buttonText}</button>
            </span>
          </div>
          <p className="text-muted omega" style={{ 'margin-top': '5px', 'margin-left': '1px' }}>
            Preview: <strong>{this.props.addonText + this.state.inputPreview}</strong>
          </p>
        </FormGroup>
      );
    },

    onChange: function(e) {
      var value = e.target.value;

      this.setState({
        inputPreview: this.state.transform(value)
      });
    },

    buttonState: function() {
      return this.state.inputPreview.length >= 2 ? false : true;
    },

    transform: function(text) {
      return text.replace(/[^\w-\.]+/g, '-').toLowerCase();
    },

    onSubmit: function(e) {
      e.preventDefault();
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = InputPreview;
  }

  window.InputPreview = InputPreview;
})();
