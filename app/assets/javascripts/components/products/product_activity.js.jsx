'use strict';

const Accordion = require('../accordion.js.jsx');
const BountyMarksStore = require('../../stores/bounty_marks_store');
const Button = require('../ui/button.js.jsx');
const Immutable = require('immutable');
const IntroductionActions = require('../../actions/introduction_actions');
const IntroductionStore = require('../../stores/introduction_store');
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

let ProductActivity = React.createClass({
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
    IntroductionStore.addChangeListener(this.onIntroductionChange);
    NewsFeedItemsStore.addChangeListener(this.onNewsFeedChange);
    PostMarksStore.addChangeListener(this.onPostMarksChange);
    ProductStore.addChangeListener(this.onProductChange);
  },

  componentWillUnmount() {
    BountyMarksStore.removeChangeListener(this.onBountyMarksChange);
    IntroductionStore.removeChangeListener(this.onIntroductionChange);
    NewsFeedItemsStore.removeChangeListener(this.onNewsFeedChange);
    PostMarksStore.removeChangeListener(this.onPostMarksChange);
    ProductStore.removeChangeListener(this.onProductChange);
  },

  getInitialState() {
    return {
      bountyMarks: BountyMarksStore.getMarks(),
      introduction: IntroductionStore.getIntroduction(),
      items: NewsFeedItemsStore.getNewsFeedItems(),
      postMarks: PostMarksStore.getMarks(),
      product: ProductStore.getProduct()
    };
  },

  handleIntroductionChange(e) {
    IntroductionActions.updateIntroduction(e.target.value);
  },

  handleIntroductionSubmit() {
    let introduction = IntroductionStore.getIntroduction();
    let product = this.state.product;
    let slug = product.slug;
    let userId = UserStore.getId();

    IntroductionActions.submitIntroduction(slug, userId, introduction)
  },

  onBountyMarksChange() {
    this.setState({
      bountyMarks: BountyMarksStore.getMarks()
    });
  },

  onIntroductionChange() {
    this.setState({
      introduction: IntroductionStore.getIntroduction()
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
    let leftColumnClasses = React.addons.classSet({
      'mb2': true,
      'px3': true,
      'sm-col': true,
      'sm-col-8': true,
      'sm-mb0': true
    });

    let rightColumnClasses = React.addons.classSet({
      'md-col': true,
      'md-col-4': true,
      'px3': true
    });

    return (
      <div>
        <ProductHeader />

        <div className="container mt3">
          <div className="clearfix mxn3">
            <div className={leftColumnClasses}>
              {this.renderNewsFeed()}
            </div>

            <div className={rightColumnClasses}>
              {this.renderIntroductionForm()}
              <Accordion title="Activity Filters">
                <ul className="list-reset mxn2">
                  {this.renderPostFilters()}
                </ul>
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    );
  },

  renderBountyFilters() {
    let renderedTags = this.renderMarkFilters(
      BOUNTY_TARGET_TYPE,
      (this.state.bountyMarks || Immutable.List())
    ) || [];


    return (
      <Accordion title="Bounty Tags">
        <ul className="list-reset mxn2">
          {renderedTags}
        </ul>
      </Accordion>
    );
  },

  renderIntroductionForm() {
    let product = this.state.product;
    let user = UserStore.getUser();

    if (user && !product.is_member) {
      return (
        <div className="mb2">
          <Tile>
            <div className="px3 py2">
              <h5 className="mt0 mb1">Hey {user.username}!</h5>
              <div className="gray-1 h6 markdown markdown-normalized py1 mb2">
                Ready to pitch in on {product.name}? Introduce yourself.
              </div>

              <TypeaheadUserTextArea className="form-control mb2"
                  onChange={this.handleIntroductionChange}
                  placeholder={"What kinds of problems do you like to solve? What skills can you contribute to " +
                    product.name + "? Are you a coder, a designer, a marketer, or simply a doer?"}
                  rows="2"
                  value={this.state.introduction}
                  style={{ fontSize: 13 }} />
              <div className="center">
                <Button type="default" action={this.handleIntroductionSubmit}>
                  Introduce yourself!
                </Button>
              </div>
            </div>
          </Tile>
        </div>
      );
    }

    return (
      <div className="mb2">
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
    let renderedTags = this.renderMarkFilters(
      POST_TARGET_TYPE,
      this.state.postMarks.sort()
    ) || [];

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
      <li className="mb1 lh0_9" key={'archived-posts-' + product.slug}>
        <a href={archivedPostsHref} className="pill-hover block py1 px3">
          <span className="fs1 fw-500 caps">archived posts</span>
        </a>
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
      <li className="mb1 lh0_9" key={'bounties-' + product.slug}>
        <a href={bountyHref} className="pill-hover block py1 px3">
          <span className="fs1 fw-500 caps">bounties</span>
        </a>
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
      <li className="mb1 lh0_9" key={'introductions-' + product.slug}>
        <a href={introHref} className="pill-hover block py1 px3">
          <span className="fs1 fw-500 caps">introductions</span>
        </a>
      </li>
    );

    return renderedTags;
  }
});

module.exports = ProductActivity;
