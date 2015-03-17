var Jumbotron = React.createClass({
  render() {
    return (
      <div className="jumbotron">
        <div className="container px2" style={{paddingTop: '6rem', paddingBottom: '6rem'}}>
          {this.props.children}
        </div>
      </div>
    )
  }
})

module.exports = Jumbotron
