'use strict'

const ProfileBountiesAwarded = require('./profile_bounties_awarded.js.jsx')
const ProfileHeartsReceived = require('./profile_hearts_received.js.jsx')
const url = require('url')

module.exports = React.createClass({
  displayName: 'UserProfile',

  getInitialState() {
    return {
      tab: this.getTab()
    }
  },

  setActiveIfActiveTab(tab) {
    return this.state.tab === tab ? 'active' : null;
  },

  render() {
    return <div>
      <div className="border-bottom border-gray-5 pb2">
        <ul className="nav nav-pills">
          <li className={this.setActiveIfActiveTab('hearts')}>
            <a href="#hearts">Hearts</a>
          </li>
          <li className={this.setActiveIfActiveTab('bounties')}>
            <a href="#bounties">App Coins</a>
          </li>
        </ul>
      </div>

      {this.renderCurrentTab()}
    </div>
  },

  renderCurrentTab() {
    switch (this.state.tab) {
      case 'hearts':
        return <ProfileHeartsReceived user_id={this.props.username} />
      case 'settings':
        return <ProfileSettings user_id={this.props.username} />
      case 'bounties':
      default:
        return <ProfileBountiesAwarded user_id={this.props.username} />
    }
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
