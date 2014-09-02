/** @jsx React.DOM */

(function() {
  var BountyPostingHeader = React.createClass({
    getInitialState: function() {
      return {
        posting: this.props.posting
      }
    },
    render: function() {
      return this.state.posting ? PostedBountyHeader(this.state.posting) : UnpostedBountyHeader(this.props)
    }
  })

  var PostedBountyHeader = React.createClass({
    render: function() {
      return <p className="text-center text-muted lead">
        <strong>
          <time data-diff dateTime={this.props.ends_at}></time> days left
        </strong> to start this bounty before it expires
      </p>
    }
  })

  var UnpostedBountyHeader = React.createClass({
    getInitialState: function() {
      return {
        popoverShown: false
      }
    },

    render: function() {
      return <BsPopover content={BountyPostCategories({categorySelected: this.handleCategorySelected})}
                placement="bottom"
                visible={this.state.popoverShown}
                onHide={this.handleHide}>
        <p className="text-center text-muted lead">
          Only visible to {this.props.product.name} partners.&nbsp;
          {this.props.slots > 0 ? this.createPosting() : this.postingsFull()}
        </p>
      </BsPopover>
    },

    createPosting: function() {
      return <span>
        <a href="#feature" onClick={this.togglePopover}>Feature it</a>&nbsp;to community for 7 days
        (you have {app.pluralize(this.props.slots, 'spot')} remaining)
      </span>
    },

    postingsFull: function() {
      return <span>You have no public bounty spots remaining</span>
    },

    handleCategorySelected: function(category) {
      var product = this.props.product.slug
      window.xhr.post(
        this.props.postings_path,
        { bounty: this.props.bounty.number },
        function(err, data) {
          window.app.redirectTo('/discover/bounties?filter=' + category + '&product=' + product)
        }
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

  var BountyPostCategories = React.createClass({
    render: function() {
      return <div className="popover-content" style={{"min-width": 360}}>
        <a href="javascript:;" className="list-group-item" onClick={this.clickHandler('design')}>Design</a>
        <a href="javascript:;" className="list-group-item" onClick={this.clickHandler('marketing')}>Marketing</a>
        <a href="javascript:;" className="list-group-item" onClick={this.clickHandler('frontend')}>Front-End Development</a>
        <a href="javascript:;" className="list-group-item" onClick={this.clickHandler('backend')}>Back-End Development</a>
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
    module.exports = BountyPostingHeader
  }

  window.BountyPostingHeader = BountyPostingHeader
})();
