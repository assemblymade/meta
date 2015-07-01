var FormGroup = React.createClass({
  propTypes: {
    error: React.PropTypes.string
  },

  getDefaultProps: function() {
    return {
      error: null
    };
  },

  render: function() {
    var classes = React.addons.classSet({
      'form-group': true,
      'has-error': this.props.error,
      'has-feedback': this.props.error
    })
    return (
      <div className={classes}>
        {this.props.children}
        {this.props.error ? this.errorGlyph() : null}
        {this.props.error ? this.errorMessage() : null}
      </div>
    )
  },

  errorGlyph: function() {
    return <span className="glyphicon glyphicon-remove form-control-feedback"></span>
  },

  errorMessage: function() {
    return <span className="h6">{this.props.error}</span>
  }
});

module.exports = window.FormGroup = FormGroup;
