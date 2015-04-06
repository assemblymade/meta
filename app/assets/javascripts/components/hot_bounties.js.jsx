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
    bounties: React.PropTypes.array.isRequired,
    users: React.PropTypes.array.isRequired
  },

  renderHeader: function() {
    return (
      <div>
        <h3>
          Top Bounties
        </h3>
      </div>
    )
  },

  renderBounties: function() {
    var users = this.props.users;

    return (
      <div>
        <table>
          {_.map(this.props.bounties, function(d, e) {
            return (
              <tr>
                <td>
                  <a href={d.url}>
                    {d.title}
                  </a>
                </td>
                <td>
                  {d.description}
                </td>
                <td>
                  {d.created_at}
                </td>
                <td>
                  <a href={users[e].url}>
                    <AvatarWithUsername user={users[e]} />
                  </a><br/>
                  {users[e].hearts_received}
                </td>
              </tr>
            )
          })}
        </table>
      </div>
    )
  },

  render: function() {
    return (
      <div className="col-md-6 col-md-offset-3">
        {this.renderHeader()}
        <Tile>
          {this.renderBounties()}
        </Tile>
      </div>
    )

  }
});

module.exports = window.HotBounties = HotBounties;
