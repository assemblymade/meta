const TimelineItem = React.createClass({
  render() {
    return <div className="_py1_25">
      {this.props.children}
    </div>
  }
})

const Timeline = React.createClass({

  statics: {
    Item: TimelineItem
  },

  render() {
    return <div className="timeline">
      {this.props.children}
    </div>
  }

})

export default Timeline
