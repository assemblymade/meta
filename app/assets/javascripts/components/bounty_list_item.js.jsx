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
          <strong>{bounty.title}</strong>
        </a>
      )
    },

    renderTags: function() {
      return this.props.bounty.tags.map(function(tag) {
        return (
          <span>
            {' '}
            <a className="small text-info" href={tag.url}>
              #{tag.name.toLowerCase()}
            </a>
          </span>
        )
      })
    },

    renderUrgency: function() {
      var bounty = this.props.bounty

      return (
        <div className="pull-right">
          <Urgency initialLabel={bounty.urgency.label} />
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
      }

      return titles.map(function(title) {
        return (
          <span className={className} data-toggle="tooltip" title={title}>
            <span className="icon icon-app-coin"></span>
            {' '}
            <span>{bounty.earnable}</span>
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

    render: function() {
      var bounty = this.props.bounty

      return (
        <div>
          <div>
            {this.renderWinners()}
          </div>

          <div>
            {this.renderTitle()}
            {this.renderTags()}
          </div>

          <div className="clearfix small text-muted">
            {this.renderUrgency()}

            {this.renderAward()}
            {' '}
            &middot;
            {' '}
            #{bounty.number}
            {' '}
            &middot;
            {' '}
            <a className="text-muted" href={bounty.user.url}>
              @{bounty.user.username}
            </a>
            {' '}
            &middot;
            {' '}
            last update {moment(bounty.update_at).fromNow()}
            {' '}
            {this.renderProductLabel()}
          </div>
        </div>
      )
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = BountyListItem
  }

  window.BountyListItem = BountyListItem
})();
