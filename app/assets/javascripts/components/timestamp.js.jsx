/** @jsx React.DOM */

var Timestamp = React.createClass({
  componentDidMount: function() {
    $(this.getDOMNode()).timeago()
  },

  componentWillUnmount: function() {
    $(this.getDOMNode()).timeago('dispose')
  },

  render: function() {
    return (
      <time className="timestamp" dateTime={this.props.time}></time>
    )
  }
})

