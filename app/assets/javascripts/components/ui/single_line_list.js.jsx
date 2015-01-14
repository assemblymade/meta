var Label = require('./label.js.jsx')

module.exports = React.createClass({
  displayName: 'SingleLineList',

  render: function() {
    var items = _.map(this.props.items, function(item){
      return <div className="left px1">{item}</div>
    })

    return <div className="clearfix mxn1">
      {items}
    </div>
  }
})
