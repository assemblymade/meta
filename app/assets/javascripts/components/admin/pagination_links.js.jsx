/** @jsx React.DOM */

(function() {
  var PaginationLinks = React.createClass({
    getDefaultProps: function() {
      return {
        page: 1,
        pages: 10
      }
    },
    render: function() {
      var pages = []
      for (var i = 1; i <= this.props.pages; i++) {
        pages.push(<Link key={i} label={i} active={this.props.page == i} handleClick={this.handleClick(i)}/>)
      }
      return <ul className="pagination">
        {this.props.page > 0 ? <Link key="-2" label="« First" handleClick={this.handleClick(0)}/> : null}
        {this.props.page > 0 ? <Link key="-1" label="‹ Prev" rel="prev" handleClick={this.handleClick(this.props.page - 1)}/> : null}
        {pages}
        {this.props.page < this.props.pages ? <Link key={this.props.pages + 1} label="Next ›" rel="next" handleClick={this.handleClick(this.props.page + 1)}/> : null}
        {this.props.page < this.props.pages ? <Link key={this.props.pages + 2} label="Last »" rel="prev" handleClick={this.handleClick(this.props.pages)}/> : null}
      </ul>
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
        'page': true,
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
