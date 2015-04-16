'use strict';

const Button = require('../ui/button.js.jsx');
const Icon = require('../ui/icon.js.jsx');

/**
  https://github.com/pedronauck/react-video

  (The MIT License)

  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

const PlayButton = React.createClass({
  propTypes: {
    onClick: React.PropTypes.func
  },
  render() {
    let style = {
      right: '45%',
      top: '45%',
    };

    return (
      <span className="absolute" style={style}>
        <Button type="primary" action={this.props.onClick}>
          <span className="h1">
            <Icon icon="caret-right" />
          </span>
        </Button>
      </span>
    );
  }
});


const Spinner = require('../spinner.js.jsx');

module.exports = React.createClass({
  displayName: 'Video',
  propTypes: {
    from: React.PropTypes.oneOf(['youtube', 'vimeo']),
    videoId: React.PropTypes.string.isRequired,
    onError: React.PropTypes.func
  },
  getDefaultProps() {
    return {
      className: 'video'
    };
  },
  getInitialState() {
    return {
      thumb: null,
      imageLoaded: false,
      showingVideo: false
    };
  },
  isYoutube() {
    return this.props.from === 'youtube' || isNaN(this.props.videoId);
  },
  isVimeo() {
    return this.props.from === 'vimeo' || !isNaN(this.props.videoId);
  },
  componentDidMount() {
    if (!this.state.imageLoaded) {
      this.isYoutube() && this.fetchYoutubeData();
      this.isVimeo() && this.fetchVimeoData();
    }
  },
  render() {
    return (
      <div className="relative">
        {!this.state.imageLoaded && <Spinner />}
        {this.renderImage()}
        {this.renderIframe()}
      </div>
    );
  },
  renderImage() {
    if (this.state.imageLoaded && !this.state.showingVideo) {
      return (
        <div className="relative">
          <img className="inline clickable" src={this.state.thumb} onClick={this.playVideo} />
        </div>
      );
    }
  },
  renderIframe() {
    if (this.state.showingVideo) {
      let style = {
        height: 500
      };
      return <iframe frameBorder='0' width="100%" height="100%" style={style} src={this.getIframeUrl()} />;
    }
  },
  playVideo(ev) {
    if (this.getDOMNode().clientHeight < 250) {
      return ev.preventDefault();
    }

    this.setState({ showingVideo: true });
    ev.preventDefault();
  },
  getIframeUrl() {
    if (this.isYoutube()) {
      return `https://youtube.com/embed/${this.props.videoId}?autoplay=1`
    }
    else if (this.isVimeo()) {
      return `https://player.vimeo.com/video/${this.props.videoId}?autoplay=1`
    }
  },
  fetchYoutubeData() {
    let id = this.props.videoId;
    let that = this;

    $.ajax({
      url: `https://gdata.youtube.com/feeds/api/videos/${id}?v=2&alt=json`,
      success(res) {
        let gallery = res.entry['media$group']['media$thumbnail'];
        let thumb = gallery.sort((a, b) => b.width - a.width)[0].url;

        that.setState({
          thumb: thumb,
          imageLoaded: true
        })
      },
      error: that.props.onError
    });
  },
  fetchVimeoData() {
    let id = this.props.videoId;
    let that = this;

    $.ajax({
      url: `vimeo.com/api/v2/video/${id}.json`,
      success(res) {
        that.setState({
          thumb: res[0].thumbnail_large,
          imageLoaded: true
        });
      },
      error: that.props.onError
    });
  }
});
