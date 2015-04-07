var Button = require('./ui/button.js.jsx')
var LoveStore = require('../stores/love_store')
var LoveActionCreators = require('../actions/love_action_creators')
var Icon = require('./ui/icon.js.jsx')
var IconToggler = require('./ui/icon_toggler.js.jsx')
var IconWithNumber = require('./ui/icon_with_number.js.jsx')
var SvgIcon = require('./ui/svg_icon.js.jsx');
const Tile = require('./ui/tile.js.jsx')
const Nav = require('./ui/nav.js.jsx')
const UserStore = require('./../stores/user_store.js')
const AvatarWithUsername = require('./ui/avatar_with_username.js.jsx');
const Jumbotron = require('./ui/jumbotron.js.jsx')

const HotBounties = React.createClass({

  propTypes: {
    bounties: React.PropTypes.array.isRequired
  },

  renderHeader: function() {
    return (
      <div className="mb2">
        <h3 className="mb0">
          Top Bounties
        </h3>
        <h5 className="gray-2 mt0">
          Based on author's heart count and bounty freshness
        </h5>
      </div>
    )
  },

  renderBounties: function() {
    var bounties =  _.map(this.props.bounties, function(d, e) {
      return (
        <div className="mb1">
          <Tile>
            <div className="p2">
              <div className="p2">
                <p className="bold">
                  <a href={d.url}>
                    {d.title}
                  </a>
                </p>
                <p>
                  {d.description}
                </p>
              </div>
              <div className="py1 px2">
                <a href={d.author.hearts_received}>
                  <AvatarWithUsername user={d.author} />
                </a>
                <span className="ml1 gray-3 h6">
                  <Icon icon="heart" /> {d.author.hearts_received}
                </span>
              </div>
            </div>
          </Tile>
        </div>
      )
    })

    return (
      {bounties}
    )
  },

  render: function() {
    return (
      <div className="col-md-8 col-md-offset-2 mb3">
        {this.renderHeader()}
        {this.renderBounties()}
      </div>
    )

  }
});

module.exports = window.HotBounties = HotBounties;
