'use strict';

let Carousel = React.createClass({
  propTypes: {
    images: React.PropTypes.oneOfType([
      React.PropTypes.arrayOf(React.PropTypes.string),
      React.PropTypes.arrayOf(React.PropTypes.element)
    ]).isRequired
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

    let image = images[currentFocusIndex];

    let style = {
      borderTopLeftRadius: 4,
      borderTopRightRadius: 4,
      width: '100%'
    };

    if (typeof image === 'string') {
      return <img src={image} style={style} />;
    }

    image.props.style = style;

    return image;
  },

  renderThumbnails() {
    let images = this.props.images;

    if (images.length === 1) {
      return null;
    }

    let currentFocusIndex = this.state.currentFocusIndex;
    let style = {
      borderRadius: 4,
      maxWidth: 100,
      overflowY: 'hidden',
      width: 100
    };

    let renderedImages = images.map((image, i) => {
      if (images.length <= 2 && i === currentFocusIndex) {
        return null;
      }

      if (typeof image !== 'string' && i !== currentFocusIndex) {
        _.extend(image.props.style, style);
      }

      return (
        <div className="left sm-mr2" style={style} key={i}>
          <a href="javascript:void(0);" onClick={this.handleThumbnailClick.bind(this, i)}>
            {typeof image === 'string' ? <img src={image} style={style} /> : image}
          </a>
        </div>
      );
    });

    return (
      <div className="clearfix px4 mt4 center">
        {renderedImages}
      </div>
    );
  }
});

module.exports = Carousel;
