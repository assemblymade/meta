

(function() {
  var TagFilter = React.createClass({
    render: function() {
      return (
        <li className="dropdown">
          <a className="dropdown-toggle" type="button" data-toggle="dropdown" href="#">
            Tag
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
      return this.props.tags.map(function(tag) {
        var selected = tag == this.props.selected_tag

        return (
          <li className={selected ? 'active' : ''} role="presentation" key={tag}>
            <a href={this.props.buildUrl({ tag: tag })} role="menuitem" tabIndex="-1">
              {tag}
            </a>
          </li>
        )
      }.bind(this))
    }
  })

  if (typeof module !== 'undefined') {
    module.exports = TagFilter
  }

  window.TagFilter = TagFilter
})();
