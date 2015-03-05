

(function() {
  var BountyPostingButton = React.createClass({
    getInitialState: function() {
      return {
        posting: this.props.posting
      }
    },
    render: function() {
      return this.props.posting ? PostedBountyButton(this.props) : UnpostedBountyButton(this.props)
    }
  })

  var UnpostedBountyButton = React.createClass({
    getInitialState: function() {
      return {
        popoverShown: false
      }
    },

    render: function() {
      <span className="gray-2" data-toggle="tooltip" title="You have 3 featured Bounties. Close or unfeature one of them to feature this">There are no available spots to feature this</span>

      return this.props.spotsAvailable > 0 ? this.button() : this.info()
    },

    button: function() {
      return <BsPopover content={BountyPostCategories({categorySelected: this.handleCategorySelected})}
                placement="bottom"
                visible={this.state.popoverShown}
                onHide={this.handleHide}>
        <a className="clickable btn btn-default btn-sm" onClick={this.togglePopover}>Feature this bounty</a>
      </BsPopover>
    },

    info: function() {
      return <span className="gray-2" data-toggle="tooltip" title="You have 3 featured Bounties. Close or unfeature one of them to feature this">There are no available spots to feature this</span>
    },

    createPosting: function() {
      return <span>
        This bounty is only visible to
        <a href="#feature" onClick={this.togglePopover}>Feature it</a>&nbsp;to community for 7 days
        (you have {app.pluralize(this.props.spotsAvailable, 'spot')} remaining).
      </span>
    },

    postingsFull: function() {
      return <span>You have no public bounty spots remaining.</span>
    },

    handleCategorySelected: function(category) {
      window.xhr.post(
        this.props.postings_path,
        { bounty: this.props.bounty.number, tag: category },
        function(err, data) {
          window.app.redirectTo(this.props.redirectTo)
        }.bind(this)
      )
      this.setState({popoverShown: false})
    },

    togglePopover: function() {
      this.setState({popoverShown: !this.state.popoverShown })
      return false
    },

    handleHide: function() {
      this.setState({popoverShown: false})
    }
  })

  var PostedBountyButton = React.createClass({
    render: function() {
      return <a className="clickable btn btn-default btn-sm" onClick={this.handleClick}>Unfeature this</a>
    },

    handleClick: function() {
      window.xhr.delete(
        this.props.posting_path,
        {},
        function(err, data) {
          window.app.redirectTo(this.props.redirectTo)
        }.bind(this)
      )
    }
  })

  var BountyPostCategories = React.createClass({
    render: function() {
      return <div className="popover-content" style={{ minWidth: 360 }}>
        <a className="clickable list-group-item" onClick={this.clickHandler('design')}>Design</a>
        <a className="clickable list-group-item" onClick={this.clickHandler('marketing')}>Marketing</a>
        <a className="clickable list-group-item" onClick={this.clickHandler('frontend')}>Front-End Development</a>
        <a className="clickable list-group-item" onClick={this.clickHandler('backend')}>Back-End Development</a>
      </div>
    },

    clickHandler: function(category) {
      return function(e) {
        e.preventDefault()
        this.props.categorySelected(category)
      }.bind(this)
    }
  })

  if (typeof module !== 'undefined') {
    module.exports = BountyPostingButton
  }

  window.BountyPostingButton = BountyPostingButton
})();
