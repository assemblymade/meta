(function() {
  var BountyListItem = React.createClass({
    getInitialState: function() {
      return {
        position: null
      }
    },

    componentDidUpdate: function(props, state) {
      if (this.state.position && !state.position) {
        document.addEventListener('mousemove', this.handleMouseMove)
        document.addEventListener('mouseup', this.handleMouseUp)
      } else if (!this.state.position && state.position) {
        document.removeEventListener('mousemove', this.handleMouseMove)
        document.removeEventListener('mouseup', this.handleMouseUp)
      }
    },

    handleMouseDown: function(event) {
      var bountyDiv = event.target.parentElement.parentElement
      var position = $(bountyDiv).position()
      var width = $(bountyDiv).outerWidth()
      var height = $(bountyDiv).outerHeight()

      this.setState({
        position: {
          top: position.top,
          left: position.left + 10,
          width: width,
          height: height,
          mouseX: event.pageX,
          mouseY: event.pageY
        }
      })

      this.props.handleMouseDown(this.props.bounty, event)

      event.preventDefault()
      return false
    },

    handleMouseMove: function(event) {
      var position = this.state.position

      position.top = position.top + (event.pageY - position.mouseY)

      position.mouseY = event.pageY
      position.mouseX = event.pageX

      this.setState({
        position: position
      })

      this.props.handleMouseMove(this.props.bounty, position)

      event.preventDefault()
      return false
    },

    handleMouseUp: function(event) {
      this.setState({
        position: null
      })

      this.props.handleMouseUp(this.props.bounty)
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

    renderLove: function() {
      if (!window.app.featureEnabled('much-love')) {
        return <span/>
      }

      return (
        <div className="px3 py2 border-top mb0 mt0">
          <Love heartable_type='NewsFeedItem' heartable_id={this.props.bounty.news_feed_item_id} />
        </div>
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
      var style = {}

      if(this.state.position) {
        var style = {
          position: 'absolute',
          top: this.state.position.top,
          left: this.state.position.left,
          width: this.state.position.width,
          'transition-property': 'left',
          'transition-duration': '0.5s'
        }
      }

      return (
        <div className="bg-white rounded shadow mb3" style={style} data={{ bountyId: bounty.id }}>
          <div className="table mb0">
            <div className="table-cell">
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
              {this.renderLove()}
              {this.renderLocker()}
            </div>
            <div className="table-cell bg-blue" style={{ width: 20 }} onMouseDown={this.handleMouseDown}>
            </div>
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
