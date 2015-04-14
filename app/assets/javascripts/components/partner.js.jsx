'use strict';

const Avatar = require('./ui/avatar.js.jsx')
const ProductStore = require('../stores/product_store')

const Partner = React.createClass({
  propTypes: {
    user: React.PropTypes.object.isRequired,
    size: React.PropTypes.number
  },

  render() {
    const {user} = this.props
    let coreTeamBadge = null

    if (ProductStore.isCoreTeam(user)) {
      coreTeamBadge = <img
        className="absolute top-0 right-0"
        src="/assets/core_icon.svg"
        style={{width: '1rem', height: '1rem'}} />
    }

    return <div className="relative">
      <Avatar user={user} size={this.props.size} />
      {coreTeamBadge}
    </div>
  }

})

module.exports = Partner
