var Nav = React.createClass({
  displayName: 'Nav',

  render: function() {
    return (
      <ul className="new-nav">
        {this.props.children}
      </ul>
    )
  }
})

window.Nav = module.exports = Nav
