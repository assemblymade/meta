'use strict';

const App = require('../app.js.jsx');
const AppIcon = require('../app_icon.js.jsx');
const Button = require('../ui/button.js.jsx');
const Drawer = require('../ui/drawer.js.jsx');
const Heart = require('../heart.js.jsx');
const IdeaLovers = require('../ideas/idea_lovers.js.jsx');
const IdeaProgressBar = require('../ideas/idea_progress_bar.js.jsx');
const IdeaSharePanel = require('../ideas/idea_share_panel.js.jsx');
const page = require('page');
const SvgIcon = require('../ui/svg_icon.js.jsx');
const TextPost = require('../ui/text_post.js.jsx');
const UserStore = require('../../stores/user_store');

const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;

let Idea = React.createClass({
  propTypes: {
    idea: React.PropTypes.shape({
      body: React.PropTypes.string.isRequired,
      created_at: React.PropTypes.string.isRequired,
      hearts_count: React.PropTypes.number,
      name: React.PropTypes.string.isRequired,
      url: React.PropTypes.string.isRequired,
      user: React.PropTypes.shape({
        id: React.PropTypes.string.isRequired
      }).isRequired
    })
  },

  render() {
    let idea = this.props.idea

    return (
      <div>
        <div className="p3 pb0">
          {this.renderHeader()}
        </div>
        <div className="p4 pt2">
          <TextPost author={idea.user} title={idea.name} timestamp={idea.created_at} body={idea.body} />
          {this.renderAdminRow()}
        </div>
      </div>
    )
  },

  renderAdminRow() {
    let currentUser = UserStore.getUser();

    if (currentUser && currentUser.staff) {
      let idea = this.props.idea;

      return (
        <a className="bold inline-block mt3 right" href={idea.url + '/admin'}>Admin</a>
      )
    }
  },

  renderExplanationHeading() {
    var idea = this.props.idea;
    var heartsToGo = idea.tilting_threshold - idea.hearts_count;
    if (heartsToGo > 0) {
      return (
        <p className="gray-2 h5">
          This idea needs {heartsToGo} more
          {heartsToGo === 1 ? ' heart' : ' hearts'} to be greenlit for development.
        </p>
      );
    }
  },

  renderHeartsToGo() {
    var idea = this.props.idea;
    var heartsToGo = idea.tilting_threshold - idea.hearts_count;
    if (heartsToGo > 0) {
      return (
        <small className="right gray-3 mt1 mb1 mr2">
          {heartsToGo} {heartsToGo === 1 ? 'heart' : 'hearts'} to go!
        </small>
      );
    }
    return (
      <small className="right green mt1 mb1 mr2">
        This idea has been greenlit!
      </small>
    );
  },

  getInitialState() {
    return {
      isShareDrawerOpen: false
    }
  },

  handleHeartClick() {
    this.setState({
      isShareDrawerOpen: true
    })
  },

  renderHeader() {
    var idea = this.props.idea;
    var shareMessage = 'We need help with ' + idea.name + '! via @asm';
    return [
      <div className="clearfix mb2" key="heart-and-idea">
        <div className="left p2 mr1" onClick={this.handleHeartClick}>
          <Heart
            size="medium"
            heartable_id={idea.news_feed_item.id}
            heartable_type="NewsFeedItem" />
        </div>
        <div className="overflow-hidden">
          <div className="col col-12">
            {this.renderHeartsToGo()}
            <small className="left gray-2 bold mt1 mb1">
              {idea.hearts_count} / {idea.tilting_threshold} hearts
            </small>
          </div>
          <div className="clearfix mt3 mb1 py1">
            <div className="col col-12">
              <IdeaProgressBar idea={idea} />
            </div>
          </div>
        </div>
        <div className="clearfix p2 px3">
          <Drawer open={this.state.isShareDrawerOpen}>
            <IdeaSharePanel idea={idea} size="large" message={shareMessage} />
            <hr className="mb0" />
          </Drawer>
        </div>
      </div>,
      idea.product ? this.renderProductRow() : null
    ];
  },

  renderProductRow() {
    let idea = this.props.idea;
    let product = idea.product;

    if (!_.isNull(product)) {
      return (
        <div className="mt4">
          <h6 className="mb2 center purple">Development of this idea has already started:</h6>
          <a className="block border rounded p2 mxn2 border-gray-5-hover shadow-hover" href={product.url}>
            <div className="left mr2">
              <AppIcon app={product} size={48} />
            </div>
            <div className="right p2 blue">
              <Icon icon="chevron-right" />
            </div>
            <div className="overflow-hidden">
              <h5 className="black mt0 mb0">{product.name}</h5>
              <p className="gray-2 mb0">{product.pitch}</p>
            </div>
          </a>
        </div>
      );
    }

    if (idea.user.id === UserStore.getId()) {
      return (
        <div className="mt4">
          <div className="p2 border rounded clearfix">
            <div  className="right">
              <Button action={this.hasEnoughHearts() && function() {
                  window.location = '/create?pitch=' + idea.name + '&idea_id=' + idea.id;
                }}>
                Create a product
              </Button>
            </div>
            <div className="overflow-hidden py1">
              {this.hasEnoughHearts() ?
                'Are you ready to start building this idea?' :
                'Psst! Get ten hearts to jumpstart this idea.'}
            </div>
          </div>
        </div>
      )
    }
  },

  hasEnoughHearts() {
    let { idea } = this.props;

    return idea.hearts_count >= 5 ||
      (Date.now() - new Date(idea.created_at) > TWO_DAYS && idea.hearts_count > 0);
  }
});

module.exports = Idea;
