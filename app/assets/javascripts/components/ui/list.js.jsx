var ListItem = React.createClass({
  render() {
    return <li>{this.props.children}</li>
  }
})

var List = React.createClass({

  statics: {
    Item: ListItem
  },

  propTypes: {
    type: React.PropTypes.oneOf(['inline', 'piped']).isRequired
  },

  render() {
    var type = this.props.type
    var cs = React.addons.classSet({
      'list-reset': true,
      'list--inline': type === 'inline',
      'list--piped':  type === 'piped'
    })
    return <ul className={cs}>{this.props.children}</ul>
  }
})

module.exports = List
