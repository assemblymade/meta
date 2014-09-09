/** @jsx React.DOM */

(function(){
  var Row = React.createClass({
    render: function() {
      return <div className="row">
        {this.props.children}
      </div>
    }
  })

  if (typeof module !== 'undefined') {
    module.exports = Row
  }

  window.Row = Row
})()
