/** @jsx React.DOM */

(function() {
  var SubmitButton = React.createClass({
    render: function() {
      return this.transferPropsTo(<button type="submit" />)
    },
  })

  if (typeof module !== 'undefined') {
    module.exports = SubmitButton
  }

  window.SubmitButton = SubmitButton
})()
