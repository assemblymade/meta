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

    handleFilterClick: function(filter, option) {
      return function(event) {
        this.setState({
          filters: _.uniq(this.state.filters.concat(filter))
        })
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

                <li className="dropdown">
                  <a className="dropdown-toggle" data-toggle="dropdown" href="#">
                    Creator <span className="caret"></span>
                  </a>

                  <ul className="dropdown-menu">
                    <li className="selected">
                      <a href="#">
                        @vanstee
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        @chrislloyd
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        @whatupdave
                      </a>
                    </li>
                  </ul>
                </li>

                <li className="dropdown">
                  <a className="dropdown-toggle" data-toggle="dropdown" href="#">
                    Worker <span className="caret"></span>
                  </a>

                  <ul className="dropdown-menu">
                    <li className="selected">
                      <a href="#">
                        @vanstee
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        @chrislloyd
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        @whatupdave
                      </a>
                    </li>
                  </ul>
                </li>

                <li className="dropdown">
                  <a className="dropdown-toggle" data-toggle="dropdown" href="#">
                    Order <span className="caret"></span>
                  </a>

                  <ul className="dropdown-menu">
                    <li className="selected">
                      <a href="#">
                        Highest priority
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        Lowest priority
                      </a>
                    </li>
                  </ul>
                </li>
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
