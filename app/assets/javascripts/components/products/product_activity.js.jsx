'use strict';

const Accordion = require('../ui/accordion.js.jsx');
const BountyMarksStore = require('../../stores/bounty_marks_store');
const Button = require('../ui/button.js.jsx');
const Immutable = require('immutable');
const IntroductionForm = require('./introduction_form.js.jsx');
const NewsFeed = require('../news_feed/news_feed.js.jsx');
const NewsFeedItemsStore = require('../../stores/news_feed_items_store');
const PostMarksStore = require('../../stores/post_marks_store');
const ProductHeader = require('./product_header.js.jsx');
const ProductImportantLinks = require('./product_important_links.js.jsx');
const ProductStore = require('../../stores/product_store');
const Routes = require('../../routes');
const Tile = require('../ui/tile.js.jsx');
const TypeaheadUserTextArea = require('../typeahead_user_textarea.js.jsx');
const UserStore = require('../../stores/user_store');

const BOUNTY_TARGET_TYPE = 'wip';
const INTRODUCTION_TARGET_TYPE = 'team_membership';
const POST_TARGET_TYPE = 'post';

const ProductActivity = React.createClass({
  mixins: [React.addons.PureRenderMixin],

  propTypes: {
    navigate: React.PropTypes.func.isRequired,
    params: React.PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.object
    ]),
    query: React.PropTypes.object
  },

  componentDidMount() {
    document.title = this.state.product.name;

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

    return (
      <div>
        <ProductHeader />

        <div className="container mt3">
          <div className="clearfix mxn3">
            <div className="sm-col sm-col-8 px3 mb2 sm-mb0">
              {this.renderNewsFeed()}
            </div>

            <div className="md-col md-col-4 px3">
              <div className="mb3">
                {this.renderIntroductionForm()}
              </div>
              
              {this.renderPostFilters()}
            </div>
          </div>
        </div>
      </div>
    );
  },

  renderIntroductionForm() {
    let product = this.state.product;
    let user = UserStore.getUser();

    if (user && !product.is_member) {
      return (
        <Tile>
          <div className="px3 py2">
            <IntroductionForm product={product} />
          </div>
        </Tile>
      );
    }

    return (
      <Tile>
        <div className="p3">
          <div className="block h5 mt0 mb1 bold">
            Getting Started with Updates
          </div>
          <div className="h6 m0 gray-1">
            Catch up on the latest {product.name} updates, milestones, and other announcements here.
            <br/><br/>
            Jump into chat and ping <a href={product.people_url}>@core</a> if you have any questions.
          </div>

          <div className="center mt2 border-top">
            <div className="mt2">
              <Button type="default" action={function() { window.open('chat', '_blank'); }}>
                Jump into chat
              </Button>
            </div>
          </div>
        </div>
      </Tile>
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

  renderPostFilters() {
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

        let tagName = tag[0].toUpperCase() + tag.substr(1) + ' posts'

        return (
          <li key={tag + '-' + i}>
            <a className="block py1" href={href}>{tagName}</a>
          </li>
        );
      }).toJS();
    }

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

    return <Accordion title="Filter activity">
      <ul className="list-reset">
        {renderedTags}
      </ul>
    </Accordion>
  }
});

module.exports = ProductActivity;
