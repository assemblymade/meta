'use strict';

const Accordion = require('../ui/accordion.js.jsx');
const BountyMarksStore = require('../../stores/bounty_marks_store');
const Button = require('../ui/button.js.jsx');
const Immutable = require('immutable');
const NewsFeed = require('../news_feed/news_feed.js.jsx');
const Label = require('../ui/label.js.jsx');
const NewsFeedItemsStore = require('../../stores/news_feed_items_store');
const PostMarksStore = require('../../stores/post_marks_store');
const ProductHeader = require('./product_header.js.jsx');
const ProductImportantLinks = require('./product_important_links.js.jsx');
const ProductStore = require('../../stores/product_store');
const Routes = require('../../routes');
const Tile = require('../ui/tile.js.jsx');
const TypeaheadUserTextArea = require('../typeahead_user_textarea.js.jsx');
const UserStore = require('../../stores/user_store');
const StoryTimelineFeed = require('../story_timeline_feed.js.jsx')


const BOUNTY_TARGET_TYPE = 'wip';
const INTRODUCTION_TARGET_TYPE = 'team_membership';
const POST_TARGET_TYPE = 'post';

const ProductActivity = React.createClass({
  mixins: [React.addons.PureRenderMixin],

  propTypes: {
    params: React.PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.object
    ]),
    query: React.PropTypes.object
  },

  componentDidMount() {
    window.TrackEngagement.track('product.activity')

    BountyMarksStore.addChangeListener(this.onBountyMarksChange);
    NewsFeedItemsStore.addChangeListener(this.onNewsFeedChange);
    PostMarksStore.addChangeListener(this.onPostMarksChange);
    ProductStore.addChangeListener(this.onProductChange);
  },

  componentWillUnmount() {
    BountyMarksStore.removeChangeListener(this.onBountyMarksChange);
    NewsFeedItemsStore.removeChangeListener(this.onNewsFeedChange);
    PostMarksStore.removeChangeListener(this.onPostMarksChange);
    ProductStore.removeChangeListener(this.onProductChange);
  },

  getInitialState() {
    return {
      bountyMarks: BountyMarksStore.getMarks(),
      items: NewsFeedItemsStore.getNewsFeedItems(),
      postMarks: PostMarksStore.getMarks(),
      product: ProductStore.getProduct()
    };
  },

  onBountyMarksChange() {
    this.setState({
      bountyMarks: BountyMarksStore.getMarks()
    });
  },

  onNewsFeedChange() {
    this.setState({
      items: NewsFeedItemsStore.getNewsFeedItems()
    });
  },

  onPostMarksChange() {
    this.setState({
      postMarks: PostMarksStore.getMarks()
    });
  },

  onProductChange() {
    this.setState({
      product: ProductStore.getProduct()
    });
  },

  render() {
    let product = this.state.product;
    let slug = product.slug;

    let writePostButton = <div className="mb3">
      <Button action={window.showCreatePost} block={true}>Write a new post</Button>
    </div>

    if (product && slug === 'meta' && !UserStore.isStaff()) {
      writePostButton = null
    }

    return (
      <div>
        <ProductHeader />

        <div className="container mt3">
          <div className="clearfix mxn3">
            <div className="sm-col sm-col-9 px3 mb2 sm-mb0">
              {this.renderStoryFeed()}
            </div>

            <div className="md-col md-col-3 px3">
            </div>
          </div>
        </div>
      </div>
    );
  },

  renderMarkFilters(targetType, filters) {
    if ((filters || Immutable.List()).size) {
      let product = this.state.product;
      return filters.map((tag, i) => {
        let href = Routes.product_activity_path({
          params: {
            product_id: product.slug
          },
          data: {
            type: targetType,
            mark: tag
          }
        });

        return (
          <li className="mb1 lh0_9" key={tag + '-' + i}>
            <a href={href} className="pill-hover block py1 px3">
              <span className="fs1 fw-500 caps">{tag + ' posts'}</span>
            </a>
          </li>
        );
      }).toJS();
    }
  },

  renderStoryFeed() {
    let product = this.state.product;

    return (
      <StoryTimelineFeed product={product} />
    )
  },

  renderNewsFeed() {
    let items = this.state.items;
    let product = this.state.product;

    if (items.size) {
      return <NewsFeed productPage={true}
                url={product.url} />;
    }

    return (
      <div className="center gray-1" style={{ minHeight: 300 }}>
        Hm, it looks like there isn't any activity here. Have you tried a different filter?
      </div>
    );
  },

  renderTagFilters() {
    let renderedTags = []
    let filters = this.state.postMarks.sort()

    if ((filters || Immutable.List()).size) {
      let product = this.state.product;
      renderedTags = filters.map((tag, i) => {
        let href = Routes.product_activity_path({
          params: {
            product_id: product.slug
          },
          data: {
            type: POST_TARGET_TYPE,
            mark: tag
          }
        });

        return (
          <li key={tag + '-' + i}>
            <a className="block" href={href}><Label name={tag} /></a>
          </li>
        );
      }).toJS();
    }

    return <Accordion title="Tags">
      <ul className="list-reset">
        {renderedTags}
      </ul>
    </Accordion>
  },

  renderTypeFilters() {
    let renderedTags = []
    let filters = this.state.postMarks.sort()

    let product = this.state.product;

    let archivedPostsHref = Routes.product_activity_path({
      params: {
        product_id: product.slug
      },
      data: {
        type: POST_TARGET_TYPE,
        archived: true
      }
    });

    renderedTags.push(
      <li key={'archived-posts-' + product.slug}>
        <a className="block py1" href={archivedPostsHref}>Archived posts</a>
      </li>
    );


    let bountyHref = Routes.product_activity_path({
      params: {
        product_id: product.slug
      },
      data: {
        type: BOUNTY_TARGET_TYPE
      }
    });

    renderedTags.push(
      <li key={'bounties-' + product.slug}>
        <a className="block py1" href={bountyHref}>Bounties</a>
      </li>
    );

    let introHref = Routes.product_activity_path({
      params: {
        product_id: product.slug
      },
      data: {
        type: INTRODUCTION_TARGET_TYPE
      }
    });

    renderedTags.push(
      <li key={'introductions-' + product.slug}>
        <a className="block py1" href={introHref}>Introductions</a>
      </li>
    );

    return <Accordion title="Activity types">
      <ul className="list-reset">
        {renderedTags}
      </ul>
    </Accordion>
  }
});

module.exports = ProductActivity;
