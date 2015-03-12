'use strict'

var ProfileBountiesAwarded = require('./profile_bounties_awarded.js.jsx')
var ProfileHeartsReceived = require('./profile_hearts_received.js.jsx')
var url = require('url')

module.exports = React.createClass({
  displayName: 'UserProfile',

  getInitialState() {
    return {
      tab: this.getTab()
    }
  },

  render() {
    return <div>
      <div className="border-bottom border-gray-5 pb2">
        <ul className="nav nav-pills">
          <li className={this.state.tab == 'hearts' ? 'active' : null}><a href="#hearts">Hearted Contributions</a></li>
          <li className={this.state.tab == 'bounties' ? 'active' : null}><a href="#bounties">Awarded Bounties</a></li>
        </ul>
      </div>

      {this.state.tab == 'hearts' ?
        <ProfileHeartsReceived user_id={this.props.username} /> :
        <ProfileBountiesAwarded user_id={this.props.username} />}
    </div>
  },

  componentDidMount() {
    window.addEventListener('hashchange', this.handleHashChange)
  },

  componentWillUnmount() {
    window.removeEventListener('hashchange', this.handleHashChange)
  },

  handleHashChange() {
    this.setState({
      tab: this.getTab()
    })
  },

  getTab() {
    return (url.parse(window.location.href, true).hash || 'hearts').replace('#','')
  }

})
