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
      <Jumbotron>
        <div className="container center white">
            <h1 className="mt0 mb0">
              The best product ideas &mdash; built by all of us.
            </h1>
        </div>
      </Jumbotron>
    )
  },

  renderBounties: function() {
    return (
      <div>
        <table>
          {_.map(this.props.bounties, function(d) {
            return (
              <tr>
                <td>
                  d.title
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
      <div>
        {this.renderHeader()}
      </div>
    )

  }
});

module.exports = HotBounties;
