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

var Leaderboard = React.createClass({

  getInitialState: function() {
    return {
      rank_data: [],
      show_all: false,
      staff_user: UserStore.isStaff()
    }
  },

  componentDidMount: function() {
    UserStore.addChangeListener(this.onChange)
    $.ajax({
      url: '/leaderboards',
      method: 'GET',
      success: function(data) {
          this.setState({rank_data: data});
      }.bind(this)
    });
  },

  onChange: function() {
    this.setState({staff_user: UserStore.isStaff()})
  },

  renderCategories: function(rank_data) {
    var click = function(event) {
      event.stopPropagation()
      event.preventDefault()
      this.setState({show_all: !this.state.show_all})
    }.bind(this)

    var a = _.pairs(rank_data)

    if (this.state.show_all) {
      var showAllLink = <a className="px3 py2 border-top" onClick={click}>Hide</a>
      var category_rankings = a.map(function(c){
          var name = c[0]
          var rankd = c[1]
          return this.renderCategory(name, rankd);
      }.bind(this))
      return (
        <div>
          {category_rankings}
          <div className="center">
            {showAllLink}
          </div>
        </div>
      )
    }
    else {
      var showAllLink = <a className="block center px3 py2 border-top" href="javascript:void(0)" onClick={click}>Hide</a>
      return (
        <div>
          {this.renderCategory("Overall", rank_data['Overall'])}
          {showAllLink}
        </div>
      )
    }
  },

  renderCategory: function(name, rankd) {
    var size = 30
    return (
      <div>
        <p className="h5 gray-2 center mt3">{name}</p>

          {_.map(rankd, function(d) {
            console.log(d)
            var user = {username: d[0], avatar_url: d[3]}
            return (
              <div>
                <a className="bg-gray-4-hover block" href={d[2]}>
                  <div className="clearfix px3">
                    <div className="left mr3">{d[1]}</div>
                    <div className="overflow-hidden py1">
                      <AvatarWithUsername user={user} size={35} />
                    </div>

                  </div>
                </a>
              </div>

            )
          })}
      </div>
    )
  },

  render: function() {
    if (this.state.staff_user)
      {
        return (
          <div className="py2">
            <Tile>
              <p className="center py2 h5 gray-1 bold">Recent Awards Leaderboard</p>
              {this.renderCategories(this.state.rank_data)}
            </Tile>
          </div>
        )
      }
    else {
      return (
        <div>
        </div>
      )
    }



  }

})

module.exports = Leaderboard
