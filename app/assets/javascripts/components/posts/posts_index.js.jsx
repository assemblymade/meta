var Accordion = require('../ui/accordion.js.jsx');
var Button = require('../ui/button.js.jsx');
var PostActionCreators = require('../../actions/post_action_creators');
var PostList = require('./post_list.js.jsx');
var PostsStore = require('../../stores/posts_store');
var ProductStore = require('../../stores/product_store');
var Spinner = require('../spinner.js.jsx');
var StoryTimeline = require('../story_timeline.js.jsx');
const Tile = require('../ui/tile.js.jsx')

var PostsIndex = React.createClass({
  propTypes: {
    product: React.PropTypes.object
  },

  componentDidMount: function() {
    PostsStore.addChangeListener(this.getPosts);
  },

  componentWillUnmount: function() {
    PostsStore.removeChangeListener(this.getPosts);
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

      PostActionCreators.fetchPosts(path);

      this.setState({
        loading: true
      });
    }
  },

  getInitialState: function() {
    return {
      posts: PostsStore.getPosts(this.props.product.slug)
    };
  },

  getPosts: function() {
    this.setState({
      loading: false,
      posts: PostsStore.getPosts(this.props.product.slug)
    });
  },

  render: function() {
    var posts = this.state.posts;
    var product = this.props.product;
    return (
      <div>
        <div className="clearfix mxn3">
          <div className="sm-col-right sm-col-4 px3">
            <Button action={window.showCreatePost} block={true} type="primary">Write a new post</Button>

            <div className="mt2 mb2"> {/*Filters*/}
              <Accordion title="Filters">
                <ul className="list-reset">
                  {this.renderFilters()}
                </ul>
              </Accordion>
            </div>

            <div className="mb3 lg-show">
              <Tile>
                <StoryTimeline product={product} />
              </Tile>
            </div>
          </div>

          <div className="sm-col sm-col-8 sm-px2 md-px3">
            {this.state.loading ? <Spinner /> : <PostList posts={posts} />}
          </div>
        </div>
      </div>
    );
  },

  renderFilters: function() {
    var path = window.location.pathname;
    var filterItemClasses = "block py2 px3 lh1 rounded bg-darken-1-hover";

    return [
      <li className="mb1" key="filter-all">
        <a href={path + "?discussions=true"} className={filterItemClasses} onClick={this.fetchDiscussions}>
          <span className="h5 bold caps lh1">all posts</span>
        </a>
      </li>,

      <li className="mb1" key="filter-announcements">
        <a href={path + "?announcements=true"} className={filterItemClasses} onClick={this.fetchAnnouncements}>
          <span className="h5 bold caps lh1">announcements</span>
        </a>
      </li>,

      <li className="mb1" key="filter-archived">
        <a href={path + "?archived=true"} className={filterItemClasses} onClick={this.fetchArchivedPosts}>
          <span className="h5 bold caps lh1">archived posts</span>
        </a>
      </li>
    ];
  }
});

module.exports = window.PostsIndex = PostsIndex;
