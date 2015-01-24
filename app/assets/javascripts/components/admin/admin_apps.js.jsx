var xhr = require('../../xhr')
var PaginationLinks = require('../pagination_links.js.jsx')
var parseUri = require('../../lib/parseuri')
var TableSortHeader = require('./table_sort_header.js.jsx')
var Timestamp = require('../timestamp.js.jsx')

var AdminApps = React.createClass({
  getInitialState: function() {
    var q = parseUri(window.location).queryKey

    return {
      page: q.page || 1,
      sortCol: q.sort || 'created_at',
      sortAsc: (q.direction === 'asc'),
      showTagged: (q.onlyuntagged === 'true'),
      query: q.q || '',
      rows: {}
    }
  },

  componentDidMount: function() {
    this.fetchRows(this.state.page)
  },

  render: function() {
    return <div>
      <input type="text" onChange={this.handleSearchChanged} value={this.state.query} />
      <div className="checkbox">
        <label>
          <input type="checkbox" defaultChecked={this.state.showTagged} onChange={this.handleFilterChanged} /> Only show untagged apps
        </label>
      </div>

      <table className="table table-striped">
        <thead>
          <tr>
            <TableSortHeader width={150} onClick={this.handleSortToggled('name')} asc={this.sortOrder('name')} label="Name" />
            <TableSortHeader width={300} onClick={this.handleSortToggled('pitch')} asc={this.sortOrder('pitch')} label="Pitch" />
            <TableSortHeader width={150} onClick={this.handleSortToggled('created_at')} asc={this.sortOrder('created_at')} label="Created" />
            <TableSortHeader width={150} onClick={this.handleSortToggled('tags')} asc={this.sortOrder('tags')} label="Tags" />
            <TableSortHeader width={150} onClick={this.handleSortToggled('topic')} asc={this.sortOrder('topic')} label="Topic" align="right" />
            <TableSortHeader width={150} onClick={this.handleSortToggled('showcase')} asc={this.sortOrder('showcase')} label="Showcase" align="right" />
          </tr>
        </thead>

        <tbody>
          {_.values(this.state.rows).map(function(row) {
            return DataRow(React.addons.update(row, {
              key: { $set: row.id },
              onChange: { $set: this.handleTagsChanged(row.id) }
            }))
          }.bind(this))}
        </tbody>
      </table>

      <PaginationLinks page={this.state.page} pages={this.props.totalPages} onPageChanged={this.handlePageChanged} />
    </div>
  },

  handleSearchChanged: function(e) {
    this.fetchRows(this.state.page)
    this.setState({query: e.target.value})
  },

  handlePageChanged: function(page) {
    this.fetchRows(page)
    document.body.scrollTop = document.documentElement.scrollTop = 0
  },

  handleFilterChanged: function(e) {
    this.setState({showTagged: e.target.checked}, function() {
      this.fetchRows(this.state.page)
    }.bind(this))
  },

  handleSortToggled: function(sortCol) {
    return function(e) {
      this.setState({
        sortCol: sortCol,
        sortAsc: !this.state.sortAsc
      }, this.fetchRows)
    }.bind(this)
  },

  patch: function(url, data, success, error) {
    $.ajax({
      method: 'PATCH',
      url: url,
      dataType: 'json',
      data: data,
      success: success,
      error: error
    });
  },

  handleTagsChanged: function(id) {
    return function(tags) {
      var rows = this.state.rows
      rows[id].editState = 'saving'
      rows[id].search_tags = tags.split(',')
      this.setState({
        rows: rows
      })

      var success = function(idea) {
        rows[id].editState = 'saved'
        this.setState({
          rows: rows
        })
      }
      var error = function() {
        rows[id].editState = 'error'
        this.setState({
          rows: rows
        })
      }
      this.patch('/admin/apps/' + id, { tags_string: tags }, success.bind(this), error.bind(this))
    }.bind(this)
  },

  fetchRows: _.debounce(function(page, query) {
    page = page || this.state.page
    query = query || this.state.query

    var sortDir = this.state.sortAsc ? 'asc' : 'desc'
    var url = '/admin/apps?page=' + page +
      '&sort=' + this.state.sortCol +
      '&direction=' + sortDir +
      '&onlyuntagged=' + this.state.showTagged +
      '&q=' + query

    window.history.replaceState({}, document.title, url)
    NProgress.start();
    window.xhr.get(url, function(err, responseText) {
      var apps = {}
      JSON.parse(responseText).map(function(p){
        apps[p.id] = p
      })
      this.setState({rows: apps, page: page})
      NProgress.done()
    }.bind(this))
  }, 500),

  sortOrder: function(col) {
    return this.state.sortCol == col ? this.state.sortAsc : null
  }
})

var DataRow = React.createClass({
  getInitialState: function() {
    return {
      pending: false,
      pendingTags: null,
      dirty: false,
      state: this.props.state
    }
  },

  render: function() {
    var bgColor = '#fff'
    if (this.state.pending || this.props.editState == 'saving') {
      bgColor = '#fcf8e3'
    } else if (this.props.editState == 'saved') {
      bgColor = '#dff0d8'
    }

    return <tr>
      <td>
        <strong>
          <a href={this.props.url} target="_blank" tabIndex="-1">{this.props.name}</a>
        </strong>
      </td>
      <td>{this.props.pitch}</td>
      <td><Timestamp time={this.props.created} /></td>
      <td className="text-right">
        <input type="text" className="form-control"
                value={this.state.dirty ? this.state.pendingTags : this.props.search_tags.join(',')}
                style={{ backgroundColor: bgColor }}
                onChange={this.handleChange}
                onBlur={this.persistChange}
        />
      </td>
      <td>{this.props.topic}</td>
      <td>{this.props.showcase}</td>
    </tr>
  },

  handleChange: function(e) {
    this.setState({
      dirty: true,
      pendingTags: e.target.value
    })
  },

  persistChange: function() {
    if (this.state.dirty && (this.state.pendingTags != this.props.tags)) {
      this.props.onChange(this.state.pendingTags)
      this.setState({pendingTags: null, dirty: false})
    }
  }
})


if (typeof module !== 'undefined') {
  module.exports = AdminApps;
}

window.AdminApps = AdminApps;
