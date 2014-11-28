/** @jsx React.DOM */

(function() {
  var BountyListItem = React.createClass({
    renderWinners: function() {
      var bounty = this.props.bounty

      var winners = bounty.winners.map(function(user) {
        var title = "Awarded to @" + user.username

        return (
          <li data-toggle="tooltip" title={title}>
            <Avatar user={user} size={18} style={{ display: 'inline-block' }} />
          </li>
        )
      })

      var emptyState = (
        bounty.workers.map(function(user) {
          var title = "Assigned to @" + user.username

          return (
            <li data-toggle="tooltip" title={title}>
              <Avatar user={user} size={18} style={{ display: 'inline-block' }} />
            </li>
          )
        })
      )

      var listItems = null

      if(bounty.winners.length) {
        listItems = winners
      } else if(bounty.state != 'resolved') {
        listItems = emptyState
      }

      return (
        <ul className="list-inline text-muted small right">
          {listItems}
          <li>
            <strong>
              <span className="icon icon-speech icon-left"></span>
              {' '}
              {bounty.comments_count}
              <span className="sr-only">comments</span>
            </strong>
          </li>
        </ul>
      )
    },

    renderTitle: function() {
      var bounty = this.props.bounty

      return (
        <a href={bounty.url}>
          {bounty.title}
          {' '}
          <span className="gray-dark ml1">
            #{bounty.number}
          </span>
        </a>
      )
    },

    renderTags: function() {
      return this.props.bounty.tags.map(function(tag) {
        return (
          <a className="caps gray-dark mr1" href={tag.url}>
            #{tag.name.toLowerCase()}
          </a>
        )
      })
    },

    renderUrgency: function() {
      var bounty = this.props.bounty

      var urgencies = ['Urgent', 'Now', 'Someday']

      return (
        <div className="right">
          <Urgency initialLabel={bounty.urgency.label} state={bounty.state} url={bounty.urgency_url} urgencies={urgencies} />
        </div>
      )
    },

    renderAward: function() {
      var bounty = this.props.bounty

      if(bounty.product.meta) {
        return
      }

      var className = null
      var titles = null
      if(bounty.state == 'open' || (bounty.state == 'reviewing' && !bounty.workers.length)) {
        className = 'text-warning'
        titles = ['Available']
      } else if(bounty.state != 'resolved' && bounty.workers.length) {
        className = 'text-warning'

        if(bounty.workers.length == 1) {
          titles = ['1 person working']
        } else {
          titles = [bounty.workers.length + ' people working']
        }
      } else if(bounty.state == 'resolved' && bounty.winners.length) {
        className = 'text-muted'
        
        titles = bounty.winners.map(function(user) {
          return 'Awarded to @' + user.username
        })
      } else if(bounty.state == 'resolved') {
        className = 'text-muted'
        titles = ['Closed']
      } else {
        return
      }

      return titles.map(function(title) {
        return (
          <span className={className} data-toggle="tooltip" title={title}>
            <span className="icon icon-app-coin"></span>
            {' '}
            <span>{bounty.earnable}</span>
            {' '}
            <span className="icon icon-chevron-down"></span>
          </span>
        )
      })
    },

    renderProductLabel: function() {
      if(this.props.product) {
        return
      }

      var product = this.props.bounty.product

      return (
        <span>
          in
          {' '}
          <a className="text-muted" href={product.url}>
            {product.name}
          </a>
        </span>
      )
    },

    renderLocker: function() {
      var bounty = this.props.bounty

      if(!bounty.locker) {
        return
      }

      var user = bounty.locker

      return (
        <div className="px3 py2 border-top h6 mb0 mt0">
          <Avatar user={user} size={18} style={{ display: 'inline-block' }} />
          {' '}
          <a href={user.url} className="bold black">
            {user.username}
          </a>
          {' '}
          <span className="gray-dark">
            has {moment(bounty.locked_at).add(60, 'hours').fromNow(true)} to work on this
          </span>
        </div>
      )
    },

    render: function() {
      var bounty = this.props.bounty

      return (
        <div className="bg-white rounded shadow mb2">
          <div className="p3">
            <div className="h4 mt0 mb1">
              {this.renderTitle()}
            </div>

            <div>
              <div className="right ml2">
                {this.renderUrgency()}
              </div>

              <span className="mr2">
                <BountyValuation {...this.props.bounty} {...this.props.valuation} />
              </span>

              <span className="gray mr2">
                <span className="fa fa-comment"></span>
                {' '}
                {bounty.comments_count}
              </span>

              <span className="h6 mt0 mb0">
                {this.renderTags()}
              </span>
            </div>
          </div>

          {this.renderLocker()}
        </div>
      )
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = BountyListItem
  }

  window.BountyListItem = BountyListItem
})();
