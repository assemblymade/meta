/** @jsx React.DOM */

// From https://gist.github.com/insin/8449696
(function(){

  var BsModalMixin = function() {
    var handlerProps =
      ['handleShow', 'handleShown', 'handleHide', 'handleHidden']

    var bsModalEvents = {
      handleShow: 'show.bs.modal'
    , handleShown: 'shown.bs.modal'
    , handleHide: 'hide.bs.modal'
    , handleHidden: 'hidden.bs.modal'
    }

    return {
      propTypes: {
        handleShow: React.PropTypes.func
      , handleShown: React.PropTypes.func
      , handleHide: React.PropTypes.func
      , handleHidden: React.PropTypes.func
      , backdrop: React.PropTypes.bool
      , keyboard: React.PropTypes.bool
      , show: React.PropTypes.bool
      , remote: React.PropTypes.string
      }

    , getDefaultProps: function() {
        return {
          backdrop: true
        , keyboard: true
        , show: true
        , remote: ''
        }
      }

    , componentDidMount: function() {
        var $modal = $(this.getDOMNode()).modal({
          backdrop: this.props.backdrop
        , keyboard: this.props.keyboard
        , show: this.props.show
        , remote: this.props.remote
        })
        handlerProps.forEach(function(prop) {
          if (this[prop]) {
            $modal.on(bsModalEvents[prop], this[prop])
          }
          if (this.props[prop]) {
            $modal.on(bsModalEvents[prop], this.props[prop])
          }
        }.bind(this))
      }

    , componentWillUnmount: function() {
        var $modal = $(this.getDOMNode())
        handlerProps.forEach(function(prop) {
          if (this[prop]) {
            $modal.off(bsModalEvents[prop], this[prop])
          }
          if (this.props[prop]) {
            $modal.off(bsModalEvents[prop], this.props[prop])
          }
        }.bind(this))
      }

    , hide: function() {
        $(this.getDOMNode()).modal('hide')
      }

    , show: function() {
        $(this.getDOMNode()).modal('show')
      }

    , toggle: function() {
        $(this.getDOMNode()).modal('toggle')
      }

    , renderCloseButton: function() {
        return <button
          type="button"
          className="close"
          onClick={this.hide}
          dangerouslySetInnerHTML={{__html: '&times'}}
        />
      }
    }
  }()

  if (typeof module !== 'undefined') {
    module.exports = BsModalMixin
  }

  window.BsModalMixin = BsModalMixin
})()
