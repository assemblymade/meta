var Jumbotron = React.createClass({

  propTypes: {
    bg: React.PropTypes.string.isRequired
  },

  render() {
    var bg = {
      backgroundImage: "url(/assets/" + this.props.bg + ")"
    }

    return (
      <div className="bg-center bg-gray-5" style={bg}>
        <div className="container px2" style={{padding: "10rem 2rem"}}>
          {this.props.children}
        </div>
      </div>
    )
  }
})

module.exports = Jumbotron
