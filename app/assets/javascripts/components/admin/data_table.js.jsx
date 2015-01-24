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

var DataRow = React.createClass({
  render: function() {
    return <tr>
        {_(this.props.columns).map(name => <DataCell value={this.props.value[name]} />)}

        { /* TODO: extract this out of component */ }
        

    </tr>
  }
})

var DataCell = React.createClass({
  render: function() {
    return <td>
      {this.props.value}
    </td>
  }
})


var DataTable = React.createClass({
  render: function() {
    window.rows = this.props.rows
    if (!rows || rows.length == 0) {
      return null
    }

    return <table className="table table-striped">
      <thead>
        <tr>
          {_(this.props.columns).map(c => <TableSortHeader label={c} /> )}
        </tr>
      </thead>

      <tbody>
        {_(rows).map(row => <DataRow columns={this.props.columns} value={row} />)}
      </tbody>
    </table>
  }
})

module.exports = DataTable
