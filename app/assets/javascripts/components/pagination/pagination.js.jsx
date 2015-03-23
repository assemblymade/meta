var PaginationActionCreators = require('../../actions/pagination_action_creators');
var PaginationStore = require('../../stores/pagination_store');
var RoutesStore = require('../../stores/routes_store');

var Pagination = React.createClass({
  displayName: 'Pagination',

  propTypes: {
    actionCall: React.PropTypes.func.isRequired,
    maxPages: React.PropTypes.number,
    pageBuffer: React.PropTypes.number
  },

  changePage(page) {
    return function() {
      PaginationActionCreators.changePage(
        this.props.actionCall,
        page
      );
    }.bind(this);
  },

  componentDidMount() {
    PaginationStore.addChangeListener(this.updateState);
    RoutesStore.addChangeListener(this.updateState);
  },

  componentWillUnmount() {
    PaginationStore.removeChangeListener(this.updateState);
    RoutesStore.removeChangeListener(this.updateState);
  },

  componentDidUpdate(props, state) {
    if (state.currentPath != this.state.currentPath) {
      document.body.scrollTop = 0
    }
  },

  getDefaultProps() {
    return {
      maxPages: 4
    };
  },

  getInitialState() {
    return {
      currentPage: PaginationStore.getCurrentPage(),
      totalPages: PaginationStore.getTotalPages(),
      currentPath: RoutesStore.getContext().path
    };
  },

  render() {
    if (this.state.totalPages === 1) {
      return null;
    }

    return (
      <nav>
        <ul className="pagination">
          {this.renderPreviousButton()}
          {this.renderPageButtons()}
          {this.renderNextButton()}
        </ul>
      </nav>
    );
  },

  renderNextButton() {
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

  renderPageButtons() {
    var currentPage = this.state.currentPage;
    var maxPages = this.props.maxPages;
    var totalPages = this.state.totalPages;

    var pageButtons = [];

    for (var i = 1; i <= totalPages; i++) {
      if (totalPages > maxPages) {
        if (i < maxPages) {
          pageButtons.push(
            <li className={currentPage === i ? 'active' : ''} key={'page' + i}>
              <a href="javascript:void(0);" onClick={this.changePage(i)}>{i}</a>
            </li>
          );
        } else if (i >= maxPages && i === currentPage) {
          pageButtons.push(
            <li className={currentPage === i ? 'active' : ''} key={'page' + i}>
              <a href="javascript:void(0);" onClick={this.changePage(i)}>{i}</a>
            </li>
          );

          if (i !== totalPages) {
            pageButtons.push(
              <li key={'page-ellipsis' + i}>
                <a>&hellip;</a>
              </li>
            );
          }
        } else if (i === maxPages) {
          pageButtons.push(
            <li key={'page-ellipsis' + i}>
              <a>&hellip;</a>
            </li>
          );
        } else if (i === totalPages) {
          pageButtons.push(
            <li className={currentPage === i ? 'active' : ''} key={'page' + i}>
              <a href="javascript:void(0);" onClick={this.changePage(i)}>{i}</a>
            </li>
          );
        }
      } else {
        pageButtons.push(
          <li className={currentPage === i ? 'active' : ''} key={'page' + i}>
            <a href="javascript:void(0);" onClick={this.changePage(i)}>{i}</a>
          </li>
        );
      }
    }

    return pageButtons;
  },

  renderPreviousButton() {
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

  updateState() {
    this.setState({
      currentPage: PaginationStore.getCurrentPage(),
      totalPages: PaginationStore.getTotalPages(),
      currentPath: RoutesStore.getContext().path
    });
  }
});

module.exports = Pagination;
