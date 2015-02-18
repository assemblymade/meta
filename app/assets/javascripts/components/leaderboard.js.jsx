var Button = require('./ui/button.js.jsx')
var LoveStore = require('../stores/love_store')
var LoveActionCreators = require('../actions/love_action_creators')
var Icon = require('./ui/icon.js.jsx')
var IconToggler = require('./ui/icon_toggler.js.jsx')
var IconWithNumber = require('./ui/icon_with_number.js.jsx')
var SvgIcon = require('./ui/svg_icon.js.jsx');
const Tile = require('./ui/tile.js.jsx')

var Leaderboard = React.createClass({

  propTypes: {
    rank_data: React.PropTypes.array
  },

  render: function() {
    return (
      <div className = "py2">
        <Tile>
          <h4 className="center">Leaderboard</h4>
          {renderCategories(this.props.rank_data);}
        </Tile>
      </div>
    )
  },

  renderCategories: function(rank_data) {
    return _.map(rank_data, function(rankd) {
      return renderCategory(rankd);
    });
  },

  renderCategory: function(rank) {
    return (
      <div>
        {rank[0]}
        <table>
          <tbody>
            <tr>
              <td>
                {rank[1]}
              </td>
              <td>
                {rank[2]}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }

})

module.exports = Leaderboard
