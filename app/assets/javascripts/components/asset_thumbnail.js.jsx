/** @jsx React.DOM */

(function(){
  var AssetThumbnail = React.createClass({
    propTypes: {
      preview: React.PropTypes.string.isRequired,
      url: React.PropTypes.string.isRequired,
      name: React.PropTypes.string.isRequired
    },

    getInitialState: function() {
      return {
        showLightbox: false
      }
    },

    render: function() {
      var lightbox = null
      if (this.imageAsset() && this.state.showLightbox) {
        lightbox = <ImageLightbox src={this.props.url} name={this.props.name} onHidden={this.handleHidden} />
      }
      return <div onClick={this.handleClick} className="clickable">
        <img src={this.props.preview} alt={this.props.name} className="img-rounded" />
        <div>
          <a href={this.props.url} target="_blank" className="text-small">
            {this.props.name} <span className="glyphicon glyphicon-new-window text-muted" />
          </a>
        </div>
        {lightbox}
      </div>
    },

    imageAsset: function() {
      var ext = this.props.url.split('.').pop()
      return ['pdf', 'psd'].indexOf(ext) == -1
    },

    handleClick: function() {
      this.setState({showLightbox: true})
    },

    handleHidden: function() {
      this.setState({showLightbox: false})
    }
  })

  var ImageLightbox = React.createClass({
    componentDidMount: function() {
      $(this.getDOMNode()).modal('show').on('hidden.bs.modal', this.props.onHidden)
    },

    render: function() {
      return <Lightbox ref="lightbox" footer={this.footer()} size="modal-lg">
        <img src={this.props.src} name={this.props.name} />
      </Lightbox>
    },

    footer: function() {
      return <a href={this.props.src} target="_blank">
        {this.props.name} <span className="glyphicon glyphicon-new-window text-muted" />
      </a>
    }
  })

  if (typeof module !== 'undefined') {
    module.exports = AssetThumbnail
  }

  window.AssetThumbnail = AssetThumbnail
})()
