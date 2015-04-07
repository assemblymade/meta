'use strict'

import NewsFeedItemEvent from './news_feed_item_event.js.jsx';
import List from '../ui/list.js.jsx';

const NewsFeedItemBountyReviewReady = React.createClass({
  propTypes: {
    actor: React.PropTypes.object.isRequired,
    award_url: React.PropTypes.string,
    id: React.PropTypes.string.isRequired
  },

  render: function() {
    const {actor, id} = this.props
    const awardUrl = this.props.award_url

    return (
      <NewsFeedItemEvent>
        <div className="mb1">
          <a className="bold black" href={actor.url}>
            {actor.username}
          </a> submitted work to be reviewed by the core team
        </div>
        <List type="piped">
          <List.Item>
            <a className="gray-2 black-hover"
              href={awardUrl + '?event_id=' + id}
               data-method="patch"
               data-confirm={'Are you sure you want to award this task to @' + actor.username + '?'}>
              Award
            </a>
          </List.Item>
          <List.Item>
            <a className="gray-2 black-hover"
               href={awardUrl + '?event_id=' + id + '&close=true'}
               data-method="patch"
               data-confirm={'Are you sure you want to award this task to @' + actor.username + '?'}>
              Award and close
            </a>
          </List.Item>
        </List>
      </NewsFeedItemEvent>
    )
  },
})

export default NewsFeedItemBountyReviewReady
