'use strict';

const Carousel = React.createClass({
  propTypes: {
    images: React.PropTypes.arrayOf(React.PropTypes.string).isRequired
  },

  getInitialState() {
    return {
      currentFocusIndex: 0
    };
  },

  handleThumbnailClick(index, e) {
    e && e.preventDefault();

    this.setState({
      currentFocusIndex: index
    });
  },

  render() {
    let images = this.props.images;

    if (images.length < 1) {
      return null;
    }

    let style = {
      container: {
        borderRadius: 4
      }
    };

    return (
      <div style={style.container}>
        <div style={style.container}>
          {this.renderFocusImage()}
        </div>

        {this.renderThumbnails()}
      </div>
    );
  },

  renderFocusImage() {
    let currentFocusIndex = this.state.currentFocusIndex;
    let images = this.props.images;

    let style = {
      borderTopLeftRadius: 4,
      borderTopRightRadius: 4,
      maxHeight: 480,
      width: '100%'
    };

    return <img src={images[currentFocusIndex]} style={style} />;
  },

  renderThumbnails() {
    let images = this.props.images;

    if (images.length === 1) {
      return null;
    }

    let currentFocusIndex = this.state.currentFocusIndex;
    let style = {
      borderRadius: 4,
      maxHeight: 80,
      maxWidth: 100,
      width: 100
    };

    let renderedImages = images.map((image, i) => {
      if (i !== currentFocusIndex) {
        return (
          <div className="left mr2" style={style}>
            <a href="javascript:void(0);" onClick={this.handleThumbnailClick.bind(this, i)}>
              <img src={image} style={style} />
            </a>
          </div>
        );
      }
    });

    return (
      <div className="clearfix px4 mt4 center">
        {renderedImages}
      </div>
    );
  }
});

module.exports = Carousel;
