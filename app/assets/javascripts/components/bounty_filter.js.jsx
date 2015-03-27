var BountyFilterButton = require('./bounty_filter_button.js.jsx')

var BountyFilter = React.createClass({
  renderFilterDropdown: function() {
    var user = window.app.currentUser()
    var username = user && user.get('username')

    var filters = []

    if(username) {
      filters = filters.concat([
        { name: "You're assigned",      query: 'is:open assigned:' + username },
        { name: "You created",          query: 'by:' + username },
        { name: "You commented on",     query: 'commented:' + username },
        { name: "You're mentioned in",  query: 'mentioned:' + username },
        { divider: true }
      ])
    }

    filters = filters.concat([
      { name: 'Open',   query: 'is:open' },
      { name: 'Closed', query: 'is:closed' }
    ])

    return (
      <div className="dropdown">
        <a className="dropdown-toggle black bold no-wrap fs3" data-toggle="dropdown" href="#">
          Filter
          {' '}
          <span className="icon icon-chevron-down"></span>
        </a>

        <ul className="dropdown-menu" style={{ marginTop: 14, marginLeft: -24 }}>
          {filters.map(function(filter, i) {
            var onChange = function(event) {
              event.preventDefault()

              this.props.onValueChange({
                target: {
                  value: filter.query
                }
              })
            }.bind(this)

            if (filter.divider) {
              return <li className="divider" key="filter-divider"></li>
            } else {
              return (
                <li key={filter.name + '-' + i}>
                  <a href="#" onClick={onChange}>
                    {filter.name}
                  </a>
                </li>
              )
            }
          }.bind(this))}
        </ul>
      </div>
    )
  },

  renderSortDropdown: function() {
    var sorts = [
      { name: 'Priority',               value: 'priority' },
      { name: 'Most valuable',          value: 'most_valuable' },
      { name: 'Least valuable',         value: 'least_valuable' },
      { name: 'Newest',                 value: 'newest' },
      { name: 'Oldest',                 value: 'oldest' },
      { name: 'Recently updated',       value: 'recently_updated' },
      { name: 'Least recently updated', value: 'least_recently_updated' }
    ]

    var selectedSort = _.find(sorts, function(s) { return s.value == this.props.sort }.bind(this))

    return (
      <div className="dropdown">
        <a className="dropdown-toggle black bold no-wrap fs3" data-toggle="dropdown" href="#">
          Sort ({selectedSort.name})
          {' '}
          <span className="icon icon-chevron-down"></span>
        </a>

        <ul className="dropdown-menu">
          {sorts.map(function(sort, i) {
            var onChange = function(event) {
              event.preventDefault()

              this.props.onSortChange({
                target: {
                  value: sort.value
                }
              })
            }.bind(this)

            return (
              <li className={this.props.sort == sort.value ? "active" : ""} key={sort.name + '-' + i}>
                <a href="#" onClick={onChange}>
                  {sort.name}
                </a>
              </li>
            )
          }.bind(this))}
        </ul>
      </div>
    )
  },

  render: function() {
    return (
      <div className="table mb2">
        <div className="table-cell">
          <div className="bg-white rounded shadow table mb0">
            <div className="px3 py1 table-cell border-right" style={{width: '4.5rem'}}>
              {this.renderFilterDropdown()}
            </div>
            <div className="px3 table-cell gray-2">
              <input type="text" value={this.props.value} onChange={this.props.onValueChange} className="p0 full-width" style={{ border: 'none' }} />
            </div>
          </div>
        </div>
        <div className="table-cell " style={{width: '10.5rem'}}>
          <div className="py2 right-align">
            {this.renderSortDropdown()}
          </div>
        </div>
      </div>
    )
  }
})

module.exports = BountyFilter
