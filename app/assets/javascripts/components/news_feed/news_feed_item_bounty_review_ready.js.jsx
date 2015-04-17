'use strict'

const BountyStore = require('../../stores/bounty_store');
const List = require('../ui/list.js.jsx')
const NewsFeedItemEvent = require('./news_feed_item_event.js.jsx')

const NewsFeedItemBountyReviewReady = React.createClass({
  propTypes: {
    actor: React.PropTypes.object.isRequired,
    award_url: React.PropTypes.string,
    id: React.PropTypes.string.isRequired
  },

  render: function() {
    const {
      actor,
      award_url: awardUrl,
      id
    } = this.props

    return (
      <NewsFeedItemEvent timestamp={this.props.timestamp}>
        <div className="mb1">
          <a className="bold black" href={actor.url}>
            {actor.username}
          </a> submitted work to be reviewed by the core team
        </div>
        <List type="piped">
          {this.renderAwardButtons()}
        </List>
      </NewsFeedItemEvent>
    )
  },

  renderAwardButtons() {
    const {
      actor,
      award_url: awardUrl,
      id
    } = this.props

    if (awardUrl && BountyStore.isOpen()) {
      return [
        <List.Item>
          <a className="gray-2 black-hover"
            href={awardUrl + '?event_id=' + id}
             data-method="patch"
             data-confirm={'Are you sure you want to award this task to @' + actor.username + '?'}>
            Award
          </a>
        </List.Item>,

        <List.Item>
          <a className="gray-2 black-hover"
             href={this.props.award_url + '?event_id=' + id + '&close=true'}
             data-method="patch"
             data-confirm={'Are you sure you want to award this task to @' + actor.username + '?'}>
            Award and close
          </a>
        </List.Item>
      ];
    }
  }
})

module.exports = NewsFeedItemBountyReviewReady
