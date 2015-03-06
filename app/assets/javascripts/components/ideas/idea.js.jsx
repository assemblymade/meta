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
      <div className="p4">
        <TextPost author={idea.user} title={idea.name} timestamp={idea.created_at} body={idea.body} />
        {this.renderAdminRow()}
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

  hasEnoughHearts() {
    let { idea } = this.props;

    return idea.hearts_count >= 5 ||
      (Date.now() - new Date(idea.created_at) > TWO_DAYS && idea.hearts_count > 0);
  }
});

module.exports = Idea;
