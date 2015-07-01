(function() {
  var PaginationLinks = React.createClass({
    getDefaultProps: function() {
      return {
        page: 1,
        pages: 10
      }
    },

    render: function() {
      var currentPage = this.props.page
      var totalPages = this.props.pages

      if(totalPages == 1) {
        return null
      }

      var pages = _.times(totalPages, function(i) {
        var page = i + 1
        return <Link key={page} label={page} active={currentPage == page} handleClick={this.handleClick(page)} />
      }.bind(this))

      var first, prev, next, last

      if(currentPage > 1) {
        first = <Link key="-2" label="« First" handleClick={this.handleClick(1)} />
        prev = <Link key="-1" label="‹ Prev" rel="prev" handleClick={this.handleClick(currentPage - 1)} />
      }

      if(currentPage < totalPages) {
        next = <Link key={totalPages + 1} label="Next ›" rel="next" handleClick={this.handleClick(currentPage + 1)} />
        last = <Link key={totalPages + 2} label="Last »" rel="prev" handleClick={this.handleClick(totalPages)} />
      }

      return (
        <ul className="pagination">
          {first}
          {prev}
          {pages}
          {next}
          {last}
        </ul>
      )
    },

    handleClick: function(page) {
      return function(e) {
        e.preventDefault()
        this.props.onPageChanged(page)
      }.bind(this)
    }
  })

  var Link = React.createClass({
    render: function() {
      var classes = React.addons.classSet({
        'py3': true,
        'active': this.props.active
      });

      return <li className={classes}>
        <a href='#' rel={this.props.rel} onClick={this.props.handleClick}>{this.props.label}</a>
      </li>
    }
  })

  if (typeof module !== 'undefined') {
    module.exports = PaginationLinks;
  }

  window.PaginationLinks = PaginationLinks;
})();
