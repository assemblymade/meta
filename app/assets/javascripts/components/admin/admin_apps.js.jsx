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
            <TableSortHeader width={300} onClick={this.handleSortToggled('tags')} asc={this.sortOrder('tags')} label="Tags" />
            <TableSortHeader width={150} onClick={this.handleSortToggled('topic')} asc={this.sortOrder('topic')} label="Topic" />
            <TableSortHeader width={150} onClick={this.handleSortToggled('showcase')} asc={this.sortOrder('showcase')} label="Showcase" />
          </tr>
        </thead>

        <tbody>
          {_.values(this.state.rows).map(row => <DataRow
                key={row.id}
                showcases={this.props.showcases}
                topics={this.props.topics}
                onTagsChange={this.handleTagsChanged(row.id)}
                onTopicChange={this.handleTopicChanged(row.id)}
                onShowcaseChange={this.handleShowcaseChanged(row.id)}
                {...row} />
            )
          }
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
      this.setState({ rows: rows })

      var success = function(idea) {
        rows[id].editState = 'saved'
        this.setState({ rows: rows })
      }
      var error = function() {
        rows[id].editState = 'error'
        this.setState({ rows: rows })
      }
      this.patch('/admin/apps/' + id, { tags_string: tags }, success.bind(this), error.bind(this))
    }.bind(this)
  },

  handleTopicChanged: function(id) {
    return function(topic) {
      var rows = this.state.rows
      rows[id].editState = 'saving'
      rows[id].topic = topic
      this.setState({ rows: rows })

      var success = function() {
        rows[id].editState = 'saved'
        this.setState({ rows: rows })
      }
      var error = function() {
        rows[id].editState = 'error'
        this.setState({ rows: rows })
      }
      this.patch('/admin/apps/' + id, { topic: topic }, success.bind(this), error.bind(this))
    }.bind(this)
  },

  handleShowcaseChanged: function(id) {
    return function(showcase) {
      var rows = this.state.rows
      rows[id].editState = 'saving'
      rows[id].showcase = showcase
      this.setState({ rows: rows })

      var success = function() {
        rows[id].editState = 'saved'
        this.setState({ rows: rows })
      }
      var error = function() {
        rows[id].editState = 'error'
        this.setState({ rows: rows })
      }
      this.patch('/admin/apps/' + id, { showcase: showcase }, success.bind(this), error.bind(this))
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
        <br />
        <a href={this.props.url + "/admin"} target="_blank">flag</a>
      </td>
      <td>{this.props.pitch}</td>
      <td><Timestamp time={this.props.created_at} /></td>
      <td className="text-right">
        <input type="text" className="form-control"
                value={this.state.dirty ? this.state.pendingTags : this.props.search_tags.join(',')}
                style={{ backgroundColor: bgColor }}
                onChange={this.handleTagsChange}
                onBlur={this.persistTagsChange}
        />
      </td>
      <td>
        <select value={this.props.topic} onChange={this.handleTopicChange}>
          {_([''].concat(this.props.topics)).map(t => <option>{t}</option>)}
        </select>
      </td>
      <td>
        <select value={this.props.current_showcase} onChange={this.handleShowcaseChange}>
          {_([''].concat(this.props.showcases)).map(t => <option>{t}</option>)}
        </select>
      </td>
    </tr>
  },

  handleTagsChange: function(e) {
    this.setState({
      dirty: true,
      pendingTags: e.target.value
    })
  },

  handleTopicChange: function(e) {
    this.props.onTopicChange(e.target.value)
  },

  handleShowcaseChange: function(e) {
    this.props.onShowcaseChange(e.target.value)
  },

  persistTagsChange: function() {
    if (this.state.dirty && (this.state.pendingTags != this.props.tags)) {
      this.props.onTagsChange(this.state.pendingTags)
      this.setState({pendingTags: null, dirty: false})
    }
  }
})


if (typeof module !== 'undefined') {
  module.exports = AdminApps;
}

window.AdminApps = AdminApps;
