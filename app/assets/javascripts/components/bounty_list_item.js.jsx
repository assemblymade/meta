var AppCoins = require('./app_coins.js.jsx');
var BountyActionCreators = require('../actions/bounty_action_creators.js');
var HeartCount = require('./heart_count.js.jsx');
var IconWithNumber = require('./ui/icon_with_number.js.jsx')
var ListItemMixin = require('../mixins/list_item_mixin.js.jsx');
var NewsFeedItemBountyModal = require('./news_feed/news_feed_item_bounty_modal.js.jsx');


var BountyListItem = React.createClass({

  /**
   * ListItemMixin: this.onModalHidden()
   *                this.renderComments({Number: count})
   *                this.renderLove({String: news_feed_item_id})
   *                this.renderTags({[Object: tag]})
   *                this.showModal()
   */
  mixins: [ListItemMixin],

  componentDidMount: function() {
    if (this.refs.tooltip) {
      $(this.refs.tooltip.getDOMNode()).tooltip({
        container: 'body',
        placement: 'top'
      });
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

  getInitialState: function() {
    return {
      modalShown: false,
      position: null
    };
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

    BountyActionCreators.insertPlaceholder(this.props.index, height)

    event.preventDefault()
    return false
  },

  handleMouseMove: function(event) {
    var position = this.state.position
    position.top = position.top + (event.pageY - position.mouseY),
    position.mouseY = event.pageY
    position.mouseX = event.pageX

    this.setState({ position: position })

    var offset = $(this.getDOMNode()).parent().offset()
    var scrollTop = $(window).scrollTop()

    var left = position.left - 10 + offset.left
    var top = position.top + offset.top + (position.height / 2) - scrollTop

    var listItem = $(document.elementFromPoint(left, top)).closest('.js-bounty-list-item')[0]
    if (listItem && listItem.dataset && listItem.dataset.bountyId) {
      BountyActionCreators.movePlaceholder(listItem.dataset.bountyId)
    }

    event.preventDefault()
    return false
  },

  handleMouseUp: function(event) {
    this.setState({ position: null })

    BountyActionCreators.placeBounty(this.props.bounty)

    event.preventDefault()
    return false
  },

  render: function() {
    var bounty = this.props.bounty
    var style = {}

    if (this.state.position) {
      var style = {
        position: 'absolute',
        top: this.state.position.top,
        left: this.state.position.left,
        width: this.state.position.width,
        'border': '2px solid #C2C7D0'
      }
    }

    return (
      <div className="bg-white rounded shadow mb2 js-bounty-list-item visible-hover-wrapper" style={style} data-bounty-id={bounty.id}>
        <div className="table mb0">
          <div className="table-cell">
            <div className="px3 pt3 pb3">
              <div className="mt0 mb1 mtn1 h4 fw-500 clickable">
                {this.renderTitle()}
              </div>
              <div className="clearfix h6 mt0 mb0 gray-3 mxn1">
                <div className="left px1" ref="tooltip" data-toggle="tooltip" title={"Coins represent the ownership awarded for this bounty"} data-placement="top">
                  <AppCoins n={this.props.bounty.value} />
                </div>
                <div className="left px1">
                  <IconWithNumber icon={<Icon icon="comment" />} n={bounty.comments_count} />
                </div>
                { bounty.hearts_count > 0 ?
                  <div className="left px1">
                    <HeartCount count={bounty.hearts_count} />
                  </div> : null }
                <div className="left px1">
                  {this.renderTags(bounty.tags)}
                </div>
              </div>
            </div>
            {this.renderLocker()}
          </div>
          {this.renderHandle()}
        </div>
        {this.renderModal()}
      </div>
    )
  },

  renderHandle: function() {
    if (this.props.draggable) {
      var handleClasses = ["handle", "table-cell"]

      if (this.state.position) {
        handleClasses.push("active")
      }

      return (
        <div className={handleClasses.join(' ')} onMouseDown={this.handleMouseDown} />
      )
    }
  },

  renderLocker: function() {
    var bounty = this.props.bounty

    if(!bounty.locker) {
      return
    }

    var user = bounty.locker

    return (
      <div className="px3 py2 border-top h6 mb0 mt0 clearfix">
        <div className="left mr1">
          <Avatar user={user} size={18} />
        </div>
        <div className="overflow-hidden">
          <a href={user.url} className="bold black">
            {user.username}
          </a>
          {' '}
          <span className="gray-2">
            has {moment(bounty.locked_at).add(60, 'hours').fromNow(true)} to work on this
          </span>
        </div>
      </div>
    )
  },

  renderModal: function() {
    if (this.state.modalShown) {
      var bounty = this.props.bounty;

      var item = {
        commentable: true,
        id: bounty.news_feed_item_id,
        product: this.props.product,
        productPage: true,
        target: bounty
      };

      return <NewsFeedItemBountyModal item={item} onHidden={this.onModalHidden} />;
    }
  },

  renderTitle: function() {
    var bounty = this.props.bounty
    var classes = bounty.closed_at === null ? null : 'gray-2'

    return (
      <a className={classes} href={bounty.url}>
        {bounty.title} {' '}
        <span className="gray-2 fs4">
          #{bounty.number}
          <span className="gray-2 visible-hover fw-200"> posted {moment(bounty.created_at).fromNow()}</span>
        </span>
      </a>
    )
  }
});

module.exports = BountyListItem
