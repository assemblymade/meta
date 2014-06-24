/** @jsx React.DOM */

var FormGroup = React.createClass({
  getDefaultProps: function() {
    return { error: null }
  },

  render: function() {
    var classes = React.addons.classSet({
      'form-group': true,
      'alert-danger': this.props.error
    })
    console.log(this.props, classes)
    return (
      <div className={classes}>
        {this.props.children}
      </div>
    )
  }
})