var Jumbotron = React.createClass({
  render() {
    return (
      <div className="jumbotron">
        {this.props.children}
      </div>
    )
  }
})

module.exports = Jumbotron
