var Accordion = require('../accordion.js.jsx');
var PostActionCreators = require('../../actions/post_action_creators');
var PostList = require('./post_list.js.jsx');
var PostsStore = require('../../stores/posts_store');
var ProductStore = require('../../stores/product_store');
var Spinner = require('../spinner.js.jsx');

var PostsIndex = React.createClass({
  displayName: 'PostsIndex',
  propTypes: {
    initialPosts: React.PropTypes.array.isRequired
  },

  componentDidMount: function() {
    PostsStore.addChangeListener(this.getPosts);
  },

  fetchAnnouncements: function(e) {
    this.fetchPosts(e, window.location.pathname + '.json?announcements=1');
  },

  fetchArchivedPosts: function(e) {
    this.fetchPosts(e, window.location.pathname + '.json?archived=1');
  },

  fetchDiscussions: function(e) {
    this.fetchPosts(e, window.location.pathname + '.json?discussions=1');
  },

  fetchPosts: function(e, path) {
    var product = this.props.product;

    if (product) {
      e.preventDefault();

      PostActionCreators.fetchPosts(path, product.slug);

      this.setState({
        loading: true
      });
    }
  },

  getDefaultProps: function() {
    var product = ProductStore.getProduct();

    if (!product) {
      return {}
    }

    return {
      initialPosts: PostsStore.getPosts(product.slug),
      product: product
    };
  },

  getInitialState: function() {
    return {
      posts: this.props.initialPosts
    };
  },

  getPosts: function() {
    this.setState({
      loading: false,
      posts: PostsStore.getPosts(this.props.product.slug)
    });
  },

  render: function() {
    return (
      <div>
        {this.renderPosts()}
      </div>
    );
  },

  renderPosts: function() {
    var posts = this.state.posts;
    var product = this.props.product;

    return (
      <div className="row">
        <div className="col-xs-12 col-sm-4 r768_float-right">
          <div className="col-sm-11 col-sm-push-1 p0">
            <div className="bg-white rounded shadow pt3 pr3 pb4 pl3 mb2" style={{paddingLeft: '1.75rem'}}>
              <div className="block h5 mt0 mb1 bold">
                Getting Started
              </div>
              <div className="h6 m0 gray-1">
                Updates are a great way to keep new contributors up to date
                with progress and new ways to help out. When you're ready,
                we'll also email the entry to everyone following
                {' '}<a href={product.url}>{product.name}</a>. You can include images and
                use Markdown to make it more awesome.
              </div>
            </div>

            <div className="col-xs-6 col-sm-12">
              <div className="pb1"> {/*Filters*/}
                <Accordion title="Filters">
                  <ul className="list-reset mxn2">
                    {this.renderFilters()}
                  </ul>
                </Accordion>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xs-12 col-sm-8 r768_pr0">
          {this.state.loading ? <Spinner /> : <PostList posts={posts} />}
        </div>
      </div>
    );
  },

  renderFilters: function() {
    var path = window.location.pathname;

    return [
      <li className="mb1 lh0_9" key="filter-all">
        <a href={path + "?discussions=true"} className="pill-hover block pt1 pb1 pr3 pl3" onClick={this.fetchDiscussions}>
          <span className="fs1 fw-500 caps">all posts</span>
        </a>
      </li>,

      <li className="mb1 lh0_9" key="filter-announcements">
        <a href={path + "?announcements=true"} className="pill-hover block pt1 pb1 pr3 pl3" onClick={this.fetchAnnouncements}>
          <span className="fs1 fw-500 caps">announcements</span>
        </a>
      </li>,

      <li className="mb1 lh0_9" key="filter-archived">
        <a href={path + "?archived=true"} className="pill-hover block pt1 pb1 pr3 pl3" onClick={this.fetchArchivedPosts}>
          <span className="fs1 fw-500 caps">archived posts</span>
        </a>
      </li>
    ];
  }
});

module.exports = window.PostsIndex = PostsIndex;
