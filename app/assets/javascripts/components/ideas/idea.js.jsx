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
const CircleIcon = require('../ui/circle_icon.js.jsx');
const LoveStore = require('../../stores/love_store');
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

  getInitialState: function() {
    return (
      {
        hearted: false
      }
    )
  },

  componentDidMount: function() {
    LoveStore.addListener('change', this._onHeartChange)
  },

  componentWillUnmount: function() {
    LoveStore.removeListener('change', this._onHeartChange)
  },

  _onHeartChange: function() {
    this.setState({
      hearted: !!(LoveStore.get(this.props.idea.news_feed_item.id) || {}).user_heart
    })
  },

  render() {
    let idea = this.props.idea

    return (
      <div>
        <div className="py1 px4 mb3 border-bottom">
          {this.renderHeader()}
        </div>
        <div className="px4 py2">
          <TextPost author={idea.user} title={idea.name} timestamp={idea.created_at} body={idea.body} />
          {this.renderEditLink()}
          {this.renderAdminRow()}
          {this.renderStaffRow()}
        </div>
      </div>
    )
  },

  renderEditLink() {
    let currentUser = UserStore.getUser();
    let idea = this.props.idea;
    if (currentUser && (currentUser.staff || currentUser.id === idea.user.id)) {
      return (
        <a className="inline-block mt3 right h5 px1" href={idea.url + '/edit'}>Edit</a>
      )
    }
  },

  upScore() {
    $.ajax({
      url: this.props.idea.url + "/up_score",
      type: 'PATCH'
    });
  },

  downScore() {
    $.ajax({
      url: this.props.idea.url + "/down_score",
      type: 'PATCH'
    });
  },

  renderStaffRow() {
    let currentUser = UserStore.getUser();
    if (currentUser) {
      if (currentUser.staff) {
        return (
          <div>
            <Button action={this.upScore} active={true}>Up Score X2</Button>
            <Button action={this.downScore} active={true}>Down Score /2</Button>
          </div>
        )
      }
    }
  },

  renderAdminRow() {
    let currentUser = UserStore.getUser();

    if (currentUser && currentUser.staff) {
      let idea = this.props.idea;

      return (
        <a className="inline-block mt3 right h5 px1" href={idea.url + '/admin'}>Admin</a>
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

  renderHeader() {
    let idea = this.props.idea;
    let product = idea.product;

    if (_.isNull(product)) {
      return this.renderHeartsHeader()
    } else {
      return this.renderProductRow()
    }
  },

  renderHeartsHeader() {
    var idea = this.props.idea;
    var shareMessage = 'We need help with ' + idea.name + '! via @asm';
    var hearted = this.state.hearted
    var rightSideText
    if (hearted) {
      rightSideText = function() {
        return (
          <div className="overflow-hidden">
            <div className="py2">
              <IdeaSharePanel idea={idea} size="large"/>
            </div>
          </div>
        )
      }
    }
    else {
      rightSideText = function() {
        return (
          <div className="overflow-hidden">
            <h4 className="gray-2">Should this idea become a product?</h4>
            <p className="h5 gray-2">
              If this product gets enough hearts, it will advance to the next stage of development.
            </p>
          </div>
        )
      }
    }
    return (
      <div>
        <div className="clearfix">
          <div className="left py3 center mr2">
            <Heart size="button" heartable_id={idea.news_feed_item.id} heartable_type="NewsFeedItem" />
          </div>
          {rightSideText()}
        </div>
        <div className="clearfix mb1">
          <div className="right h6 gray-2 bold center py1">
            {idea.hearts_count} hearts
          </div>
          <div className="px1 overflow-hidden">
            <IdeaLovers heartableId={this.props.idea.news_feed_item.id} limit={26} />
          </div>
        </div>
      </div>
      )
  },

  heartClick(){
    return (
      this.setState({
        hearted: true
      })
    )
  },

  renderProductRow() {
    let idea = this.props.idea;
    let product = idea.product;

    if (!_.isNull(product)) {
      return (
        <div className="mt1 mb3">
          <h5 className="mb1 center">Development of this idea has already started:</h5>
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
