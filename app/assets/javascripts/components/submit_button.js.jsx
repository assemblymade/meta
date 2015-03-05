

(function() {
  var SubmitButton = React.createClass({
    render: function() {
      return <button {...this.props} type="submit">{this.props.children}</button>
    },
  })

  if (typeof module !== 'undefined') {
    module.exports = SubmitButton
  }

  window.SubmitButton = SubmitButton
})()
