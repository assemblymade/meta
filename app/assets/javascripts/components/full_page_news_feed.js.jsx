/** @jsx React.DOM */

//= require constants
//= require dispatcher
//= require mixins/news_feed
//= require stores/news_feed_store

(function() {
  var NF = CONSTANTS.NEWS_FEED;

  window.FullPageNewsFeed = React.createClass({
    mixins: [NewsFeedMixin],

    componentWillMount: function() {
      NewsFeedStore.addChangeListener(this.getStories);
      this.fetchNewsFeed();

      this.onPush(function() {
        this.fetchNewsFeed();
      }.bind(this));
    },

    fetchNewsFeed: _.debounce(function() {
      Dispatcher.dispatch({
        action: NF.ACTIONS.FETCH_STORIES,
        event: NF.EVENTS.STORIES_FETCHED,
        data: this.props.url
      });
    }, 1000),

    getInitialState: function() {
      return {
        stories: null
      };
    },

    moreStories: function() {
      var lastStory = this.state.stories[this.state.stories.length - 1];

      Dispatcher.dispatch({
        action: NF.ACTIONS.FETCH_MORE_STORIES,
        event: NF.EVENTS.STORIES_FETCHED,
        data: this.props.url + '?top_id=' + lastStory.id
      });
    },

    onPush: function(fn) {
      if (window.pusher) {
        channel = window.pusher.subscribe('@' + this.props.user.username);
        channel.bind_all(fn);
      }
    },

    render: function() {
      return (
        <div className="sheet">
          <div className="page-header sheet-header" style={{ 'padding-left': '20px' }}>
            <h2 className="page-header-title">Your notifications</h2>
          </div>

          <div className="list-group list-group-breakout" style={{ height: '600px' }} ref="spinner">
            {this.state.stories ? this.rows(this.state.stories) : null}
          </div>

          <a href="#more" className="btn btn-block" onClick={this.moreStories}>More</a>
        </div>
      );
    },

    rows: function(stories) {
      var rows = [];

      for (var i = 0, l = stories.length; i < l; i++) {
        rows.push(
          <div className="list-group-item" key={stories[i].key}>
            <Entry story={stories[i]} actors={this.state.actors} fullPage={this.props.fullPage} />
          </div>
        );
      }

      return rows;
    }
  });

  var Entry = React.createClass({
    actors: function() {
      return _.map(
        this.props.story.actor_ids,
        function(actorId) {
          return _.findWhere(this.props.actors, { id: actorId })
        }.bind(this)
      );
    },

    body: function() {
      var target = this.props.story.activities[0].target;

      return (
        <span>
          {this.verbMap[this.props.story.verb]}
          <strong>
            {this.subjectMap[this.props.story.subject_type].call(this, target)}
          </strong>
        </span>
      );
    },

    isRead: function() {
      return this.props.story.last_read_at != null;
    },

    markAsRead: function() {
      Dispatcher.dispatch({
        event: NF.EVENTS.READ,
        action: NF.ACTIONS.MARK_AS_READ,
        data: this.props.story.id
      });
    },

    markAsReadButton: function() {
      if (!this.isRead()) {
        return <span className="icon icon-disc" onClick={this.markAsRead} title={'Mark as read'} style={{ cursor: 'pointer' }} />;
      }

      // TODO: Mark as unread
      return <span className="icon icon-circle" style={{ cursor: 'pointer' }} />
    },

    preview: function() {
      var bodyPreview = this.props.story.body_preview;

      return (
        <p className='text-muted' style={{ 'text-overflow': 'ellipsis' }}>
          {bodyPreview}
        </p>
      );
    },

    render: function() {
      var actors = _.map(this.actors(), func.dot('username')).join(', @')

      var classes = React.addons.classSet({
        'entry-read': this.isRead(),
        'entry-unread': !this.isRead(),
      });

      var productName = this.props.story.product.name;

      return (
        <div className={classes}>
          <div className='row'>
            <div className='col-md-3'>
              <a href={'/' + this.props.story.product.slug}>{productName}</a>
              <br />
              <span className='text-muted text-small'>
                {this.timestamp()}
              </span>
            </div>

            <div className='col-md-8'>
              <a className={classes} href={this.props.story.url} onClick={this.markAsRead}>
                <span style={{ 'margin-right': '5px' }}>
                  <Avatar user={this.actors()[0]} />
                </span>
                <strong>{actors}</strong> {this.body()}
              </a>
              <span className='text-small text-muted'>
                {this.preview()}
              </span>
            </div>

            <div className={'col-md-1 ' + classes}>
              {this.markAsReadButton()}
            </div>
          </div>
        </div>
      );
    },

    timestamp: function() {
      return moment(this.props.story.created).format("ddd, hA")
    },

    subjectMap: {
      Task: function(task) {
        return "#" + task.number + " " + task.title;
      },

      Discussion: function(discussion) {
        return 'a discussion';
      },

      Wip: function(bounty) {
        if (this.props.fullPage) {
          return "#" + bounty.number + " " + bounty.title;
        }

        return "#" + bounty.number;
      },
    },

    verbMap: {
      'Comment': 'commented on ',
      'Award': 'awarded',
      'Close': 'closed '
    }
  });
})();
