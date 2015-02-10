var Timeline = React.createClass({

  render() {
    return <div className="timeline">
      {this.props.children}
    </div>
  }

})

module.exports = Timeline
