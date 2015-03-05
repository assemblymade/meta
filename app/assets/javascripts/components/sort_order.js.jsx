

(function() {
  var SortOrder = React.createClass({
    render: function() {
      return (
        <li className="dropdown">
          <a className="dropdown-toggle" type="button" data-toggle="dropdown" href="#">
            Order
            {' '}
            <span className="caret"></span>
          </a>

          <ul className="dropdown-menu pull-right" role="menu">
            {this.listItems()}
          </ul>
        </li>
      )
    },

    listItems: function() {
      var options = {
        priority: 'Priority',
        most_valuable: 'Most valuable',
        least_valuable: 'Least valuable',
        newest: 'Newest',
        oldest: 'Oldest',
        recently_updated: 'Recently updated',
        least_recently_updated: 'Least recently updated'
      }

      return _.map(_.keys(options), function(option) {
        var label = options[option]
        var selected = option == this.props.selected_sort

        return (
          <li className={selected ? 'active' : ''} key={option}>
            <a href={this.props.buildUrl({ sort: option })} role="menuitem" tabIndex="-1">
              {label}
            </a>
          </li>
        )
      }.bind(this))
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = SortOrder
  }

  window.SortOrder = SortOrder
})();
