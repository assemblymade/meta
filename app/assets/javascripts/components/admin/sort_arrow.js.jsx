var SortArrow = React.createClass({
  render: function() {
    if (this.props.asc === false) {
      return <span className="caret" />
    } else if (this.props.asc === true) {
      return <span className="dropup"><span className="caret" /></span>
    }
    return <span />
  }
})

module.exports = SortArrow
