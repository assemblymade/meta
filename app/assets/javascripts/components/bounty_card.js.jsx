'use strict'

import Icon from './ui/icon.js.jsx'
import Avatar from './ui/avatar.js.jsx'
import AppCoins from './app_coins.js.jsx'

const BountyCard = React.createClass({

  propTypes: {
    bounty: React.PropTypes.object.isRequired
  },

  render: function() {
    let bounty = this.props.bounty
    let locker = null,
        meta = null,
        comments = null,
        hearts = null

    if (bounty.locker) {
      locker = <div className="right ml2 py2">
        <Avatar user={bounty.locker} />
      </div>
    }

    if (bounty.comments_count > 0) {
      comments = <div className="left px1">
        <Icon icon="comment" /> {bounty.comments_count}
      </div>
    }

    if (bounty.hearts_count > 0) {
      hearts = <div className="left px1">
        <Icon icon="heart" /> {bounty.hearts_count}
      </div>
    }

    return (
      <div className="px3 py2 clearfix">
        {locker}

        <div className="overflow-hidden">
          <div>
            {bounty.title}
          </div>
          <div className="clearfix mxn1 gray-3 h6" style={{lineHeight: '2rem'}}>
            <div className="left px1">
              <AppCoins n={bounty.coins} color="gray-3" />
            </div>
            {comments}
            {hearts}
          </div>
        </div>
      </div>
    )
  }
})

module.exports = window.BountyCard = BountyCard
