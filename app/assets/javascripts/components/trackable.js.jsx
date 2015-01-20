var Trackable = React.createClass({
  componentDidMount: function() {
    analytics.track(this.props.event, this.props.properties)
  },
  
  render: function() {
    return this.props.children
  }
})

module.exports = Trackable
