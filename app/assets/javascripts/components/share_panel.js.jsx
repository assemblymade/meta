var CircleIcon = require('./ui/circle_icon.js.jsx');
var Icon = require('./ui/icon.js.jsx');
var SHORT_HOST = "http://asm.co";

module.exports = React.createClass({
  displayName: 'SharePanel',
  getInitialState() {
    return {
      copyIcon: 'link',
      copyText: this.shortUrl().substr(0, 120) + '...',
      shortUrl: this.shortUrl(),
    };
  },

  handleCopyClick(e) {
    e.preventDefault();
    // the listeners for this event get attached in componentDidMount()
  },

  handleFacebookClick(e) {
    e.preventDefault();

    FB.ui({
      method: 'share',
      display: 'popup',
      href: this.props.url,
    }, function(response){});
  },

  handleGooglePlusClick(e) {
    e.preventDefault();

    window.open(
      _googlePlusUrl(this.props.url),
      'googlepluswindow',
        'height=450, width=550, top=' +
        ($(window).height()/2 - 225) +
        ', left=' +
        $(window).width()/2 +
        ', toolbar=0, location=0, menubar=0, directories=0, scrollbars=0'
    );
  },

  handleTwitterClick(e) {
    e.preventDefault();

    var message = this.props.message;

    window.open(
      _twitterUrl(this.shortUrl(), message),
      'twitterwindow',
      'height=450, width=550, top=' +
        ($(window).height()/2 - 225) +
        ', left=' +
        $(window).width()/2 +
        ', toolbar=0, location=0, menubar=0, directories=0, scrollbars=0'
    );
  },

  large() {
    return (
      <div>
        <div className="clearfix" key="share-buttons">
          <div className="left" key="social-buttons">
            <a href="javascript:void(0);" className="mr1" onClick={this.handleTwitterClick} key="twitter-button">
              <CircleIcon icon="twitter" margin={5} />
              <span className="gray-2 bold">Tweet</span>
            </a>

            <a href="javascript:void(0);" className="mr1" onClick={this.handleFacebookClick} key="facebook-button">
              <CircleIcon icon="facebook" margin={5} />
              <span className="gray-2 bold">Share</span>
            </a>

            <a href="javascript:void(0);" className="mr1" onClick={this.handleGooglePlusClick} key="google-button">
              <CircleIcon icon="google-plus" margin={5} />
              <span className="gray-2 bold">Plus</span>
            </a>
          </div>

          <div className="right gray-2 mt1" key="link-button">
            <a href="javascript:void(0);" className="gray-2" onClick={this.handleCopyClick} ref="copy">
              <Icon icon="link" /> {this.state.copyText}
            </a>
          </div>
        </div>
      </div>
    );
  },

  render() {
    return this.small();
  },


  shortUrl() {
    return SHORT_HOST + this.props.url;
  },

  small() {
    return (
      <div className="clearfix">
        <a href="javascript:void(0);" onClick={this.handleTwitterClick}>
          <CircleIcon icon="twitter" margin={0} />
        </a>

        <a href="javascript:void(0);" onClick={this.handleFacebookClick}>
          <CircleIcon icon="facebook" margin={10} />
        </a>

        <a href="javascript:void(0);" onClick={this.handleGooglePlusClick}>
          <CircleIcon icon="google-plus" margin={0} />
        </a>
      </div>
    );
  }
});

function _googlePlusUrl(url) {
  return 'https://plus.google.com/share?url=' +
    url +
    'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=450,width=550';
}

function _twitterUrl(url, message) {
  return 'http://twitter.com/share?url=' +
    url +
    '&text=' +
    message +
    '&';
}
