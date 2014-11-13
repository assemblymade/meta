/** @jsx React.DOM */

(function() {
  var BountyFilterButton = require('./bounty_filter_button.js.jsx')

  var BountyFilter = React.createClass({
    getDefaultProps: function() {
      return {
        tags: []
      }
    },

    getInitialState: function() {
      return {
        filters: []
      }
    },

    setFilters: function(filters) {
      filters = _.chain(filters).uniq(function(f) {
        return JSON.stringify(f)
      }).reduce(function(memo, filter) {
        if(filter.type == 'order') {
          memo = _.reject(memo, function(f) { return f.type == 'order' })
        }

        memo.push(filter)
        return memo
      }, []).value()

      this.setState({
        filters: filters
      })

      this.props.onChange(filters)
    },

    addFilter: function(filter) {
      var filters = this.state.filters

      if(filter.type == 'order') {
        filters = _.reject(filters, function(f) { return f.type == 'order' })
      }

      return filters.concat(filter)
    },

    handleFilterClick: function(filter) {
      return function(event) {
        event.preventDefault()
        this.setFilters(this.state.filters.concat(filter))
      }.bind(this)
    },

    filterText: function() {
      return this.state.filters.map(function(filter) {
        return [filter.type, filter.value].join(':')
      }).join(' ')
    },

    renderStateFilter: function() {
      var options = [
        { name: 'Open',      value: 'open' },
        { name: 'Doing',     value: 'doing' },
        { name: 'Reviewing', value: 'reviewing' },
        { name: 'Done',      value: 'done' }
      ].map(function(option) {
        return _.extend(option, ({ type: 'state' }))
      })

      return <BountyFilterButton name={'State'} options={options} onFilterClick={this.handleFilterClick} />
    },

    renderTagFilter: function() {
      var options = this.props.tags.map(function(tag) {
        return { name: tag, value: tag }
      }).map(function(option) {
        return _.extend(option, ({ type: 'tag' }))
      })

      return <BountyFilterButton name={'Tag'} options={options} onFilterClick={this.handleFilterClick} />
    },

    renderCreatorFilter: function() {
      var options = this.props.creators.map(function(user) {
        return { name: '@' + user.username, value: user.username }
      }).map(function(option) {
        return _.extend(option, ({ type: 'creator' }))
      })

      return <BountyFilterButton name={'Creator'} options={options} onFilterClick={this.handleFilterClick} />
    },

    renderWorkerFilter: function() {
      var options = this.props.workers.map(function(user) {
        return { name: '@' + user.username, value: user.username }
      }).map(function(option) {
        return _.extend(option, ({ type: 'worker' }))
      })

      return <BountyFilterButton name={'Worker'} options={options} onFilterClick={this.handleFilterClick} />
    },

    renderOrderFilter: function() {
      var options = [
        { name: 'Priority',               value: 'priority' },
        { name: 'Most valuable',          value: 'most_valuable' },
        { name: 'Lease valuable',         value: 'least_valuable' },
        { name: 'Newest',                 value: 'newest' },
        { name: 'Oldest',                 value: 'oldest' },
        { name: 'Recently updated',       value: 'recently_updated' },
        { name: 'Least recently updated', value: 'least_recently_updated' }
      ].map(function(option) {
        return _.extend(option, ({ type: 'order' }))
      })

      return <BountyFilterButton name={'Order'} options={options} onFilterClick={this.handleFilterClick} />
    },

    render: function() {
      return (
        <div>
          <div className="row mb2">
            <div className="col-xs-8">
              <input type="search" className="form-control" placeholder="Filter" value={this.filterText()} />
            </div>

            <div className="col-xs-4">
              <button className="btn btn-primary px2 right">Create a bounty</button>
            </div>
          </div>

          <div className="row"> 
            <div className="col-xs-12">
              <ul className="nav nav-pills">
                {this.renderStateFilter()}
                {this.renderTagFilter()}
                {this.renderCreatorFilter()}
                {this.renderWorkerFilter()}
                {this.renderOrderFilter()}
              </ul>
            </div>
          </div>
        </div>
      )
    }
  })

  if (typeof module !== 'undefined') {
    module.exports = BountyFilter
  }

  window.BountyFilter = BountyFilter
})();
