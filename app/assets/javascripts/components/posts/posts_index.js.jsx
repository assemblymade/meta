var Accordion = require('../accordion.js.jsx');
var PostList = require('./post_list.js.jsx');
var PostsStore = require('../../stores/posts_store');
var ProductStore = require('../../stores/product_store');

var PostsIndex = React.createClass({
  displayName: 'PostsIndex',
  propTypes: {
    initialPosts: React.PropTypes.array.isRequired
  },

  componentDidMount: function() {
    PostsStore.addChangeListener(this.getPosts);
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

    if (!posts.length) {
      return [
        <h4 className="text-muted" key="heading">
          There don't seem to be any posts here
        </h4>,

        <p key="explanation">
          {"Blog posts by " + product.name + "'s partners will appear here just as soon as they're written."}
        </p>
      ];
    }

    return (
      <div className="row">
        <div className="col-xs-12 col-sm-4 r768_float-right">
          <div className="col-sm-11 col-sm-push-1 p0">
            <div className="bg-white rounded shadow pt3 pr3 pb4 pl3 mb2" style={{paddingLeft: '1.75rem'}}>
              <div className="block h5 mt0 mb1 bold">
                Getting Started
              </div>
              <div className="h6 m0 gray-1">
                Jump into some discussion in chat and introduce yourself to <a href={product.people_url}>@core</a>.
              </div>
            </div>

            <div className="col-xs-6 col-sm-12">
              <div className="pb1"> {/*Tags*/}
                <Accordion title="Tags">
                  <ul className="list-reset mxn2">
                    {this.renderTags()}
                  </ul>
                </Accordion>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xs-12 col-sm-8 r768_pr0">
          <PostList posts={posts} />;
        </div>
      </div>
    );
  },

  renderTags: function() {
    return [
      <li className="mb1 lh0_9">
        <a href="#" className="pill-hover block pt1 pb1 pr3 pl3">
          <span className="fs1 fw-500 caps">#foo</span>
        </a>
      </li>,

      <li className="mb1 lh0_9">
        <a href="#" className="pill-hover block pt1 pb1 pr3 pl3">
          <span className="fs1 fw-500 caps">#foo</span>
        </a>
      </li>,

      <li className="mb1 lh0_9">
        <a href="#" className="pill-hover block pt1 pb1 pr3 pl3">
          <span className="fs1 fw-500 caps">#foo</span>
        </a>
      </li>
    ];
  }
});

module.exports = window.PostsIndex = PostsIndex;
