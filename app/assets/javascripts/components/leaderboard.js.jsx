var Button = require('./ui/button.js.jsx')
var LoveStore = require('../stores/love_store')
var LoveActionCreators = require('../actions/love_action_creators')
var Icon = require('./ui/icon.js.jsx')
var IconToggler = require('./ui/icon_toggler.js.jsx')
var IconWithNumber = require('./ui/icon_with_number.js.jsx')
var SvgIcon = require('./ui/svg_icon.js.jsx');
const Tile = require('./ui/tile.js.jsx')

var Leaderboard = React.createClass({

  getInitialState: function() {
    return {
      rank_data: []
    }
  },

  componentDidMount: function() {
    $.ajax({
      url: '/leaderboards',
      method: 'GET',
      success: function(data) {
          this.setState({rank_data: data});

      }.bind(this)
    });

  },

  renderCategories: function(rank_data) {
    var a = _.pairs(rank_data)
    var b = a.map(function(c){
        var name = c[0]
        var rankd = c[1]
        return this.renderCategory(name, rankd);


    }.bind(this))
    console.log('b', b)
    return b
  },

  renderCategory: function(name, rankd) {

    return (
      <div>
        {name}
        <table>
          <tbody>
              {_.map(rankd, function(d) {
                return (
                  <tr>
                    <td>{d[1]}</td>
                    <td>
                      <a href={d[2]}>
                        {d[0]}
                      </a>
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>
    )
  },

  render: function() {
    return (
      <div className = "py2">
        <Tile>
          <h4 className="center">Leaderboard</h4>
          {this.renderCategories(this.state.rank_data)}
        </Tile>
      </div>
    )
  }

})

module.exports = Leaderboard
