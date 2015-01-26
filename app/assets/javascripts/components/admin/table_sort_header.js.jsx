var SortArrow = require('./sort_arrow.js.jsx')

var TableSortHeader = React.createClass({
  render: function() {
    var classes = React.addons.classSet({
      'text-right': (this.props.align == 'right')
    });

    return <th style={{"width": this.props.width}} className={classes}>
    <a href="#" onClick={this.props.onClick} className="text-stealth-link">
    {this.props.label}
    <SortArrow asc={this.props.asc} />
    </a>
    </th>
  }
})

module.exports = TableSortHeader
