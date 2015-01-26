var PaginationActionCreators = require('../../actions/pagination_action_creators');
var PaginationStore = require('../../stores/pagination_store');

var Pagination = React.createClass({
  displayName: 'Pagination',

  propTypes: {
    actionCall: React.PropTypes.func.isRequired
  },

  changePage: function(page) {
    return function() {
      PaginationActionCreators.changePage(
        this.props.actionCall,
        page
      );
    }.bind(this);
  },

  componentDidMount: function() {
    PaginationStore.addChangeListener(this.updateState);
  },

  componentWillUnmount: function() {
    PaginationStore.removeChangeListener(this.updateState);
  },

  getInitialState: function() {
    return {
      currentPage: PaginationStore.getCurrentPage(),
      totalPages: PaginationStore.getTotalPages()
    };
  },

  render: function() {
    if (this.state.totalPages === 1) {
      return null;
    }

    return (
      <ul className="pagination">
        {this.renderPreviousButton()}
        {this.renderPageButtons()}
        {this.renderNextButton()}
      </ul>
    )
  },

  renderNextButton: function() {
    var currentPage = this.state.currentPage;

    var classes = React.addons.classSet({
      disabled: currentPage === this.state.totalPages
    });

    return (
      <li className={classes} key="next">
        <a href="javascript:void(0);" onClick={this.changePage(currentPage + 1)}>
          Next
        </a>
      </li>
    );
  },

  renderPageButtons: function() {
    var currentPage = this.state.currentPage;
    var totalPages = this.state.totalPages;
    var pageButtons = [];

    for (var i = 1; i <= totalPages; i++) {
      pageButtons.push(
        <li className={currentPage === i ? 'active' : ''} key={'page' + i}>
          <a href="javascript:void(0);" onClick={this.changePage(i)}>{i}</a>
        </li>
      )
    }

    return pageButtons;
  },

  renderPreviousButton: function() {
    var currentPage = this.state.currentPage;

    var classes = React.addons.classSet({
      disabled: currentPage === 1
    });

    return (
      <li className={classes} key="previous">
        <a href="javascript:void(0);" onClick={this.changePage(currentPage - 1)}>
          Previous
        </a>
      </li>
    );
  },

  updateState: function() {
    this.setState({
      currentPage: PaginationStore.getCurrentPage(),
      totalPages: PaginationStore.getTotalPages()
    });
  }
});

module.exports = Pagination;
