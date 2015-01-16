var AvatarWithUsername = require('./ui/avatar_with_username.js.jsx')
var BountyActionCreators = require('../actions/bounty_action_creators');
var BountyStore = require('../stores/bounty_store');
var Button = require('./ui/button.js.jsx')
var formatShortTime = require('../lib/format_short_time.js');
var Icon = require('./icon.js.jsx');
var Love = require('./love.js.jsx');
var Trackable = require('./trackable.js.jsx')
var routes = require('../routes')
var SubscriptionsStore = require('../stores/subscriptions_store')
var TextPost = require('./ui/text_post.js.jsx')
var ToggleButton = require('./toggle_button.js.jsx')
var InviteFriendBounty = require('./invite_friend_bounty.js.jsx')

// TODO (chrislloyd) hack to get it loading
var Discussion = require('./ui/discussion.js.jsx')

var ONE_HOUR = 60 * 60 * 1000

var Proposal = React.createClass({

})

module.exports = window.Proposal = Proposal
