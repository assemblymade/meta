var CircleIcon = require('../ui/circle_icon.js.jsx');
var Icon = require('../ui/icon.js.jsx');

var SHORT_HOST = "http://asm.co";

var IdeaSharePanel = React.createClass({
  propTypes: {
    idea: React.PropTypes.shape({
      greenlit_at: React.PropTypes.any,
      hearts_count: React.PropTypes.number.isRequired,
      name: React.PropTypes.string.isRequired,
      path: React.PropTypes.string.isRequired,
      tilting_threshold: React.PropTypes.number.isRequired
    }).isRequired,
    message: React.PropTypes.string,
    size: React.PropTypes.oneOf([
      'small',
      'large'
    ])
  },

  componentDidMount() {
    var self = this;
    var client = new ZeroClipboard(this.refs.copy.getDOMNode());

    client.on('ready', function(event) {
      client.on('copy', function(event) {
        event.clipboardData.setData('text/plain', self.state.shortUrl);
      });

      client.on('aftercopy', function(event) {
        self.setState({
          copyIcon: 'check',
          copyText: 'Copied!'
        });

        setTimeout(function() {
          self.setState({
            copyIcon: 'link',
            copyText: self.shortUrl().substr(0, 120) + '...'
          });
        }, 1500);
      });
    });
  },

  getDefaultProps() {
    return {
      message: 'Check out this idea on @asm:',
      size: 'small'
    };
  },

  getInitialState() {
    return {
      copyIcon: 'link',
      copyText: this.shortUrl().substr(0, 120) + '...',
      shortUrl: this.shortUrl()
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
      href: this.props.idea.url,
    }, function(response){});
  },

  handleGooglePlusClick(e) {
    e.preventDefault();

    window.open(
      _googlePlusUrl(this.props.idea.url),
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
        <div className="h5 gray-2 p1">
          Share this idea to push it to the next level.
          Community support will make this idea real.
        </div>

        <div className="clearfix" key="share-buttons">
          <div className="left" key="social-buttons">
            <a href="javascript:void(0);" className="mr1 gray-2" onClick={this.handleTwitterClick} key="twitter-button">
              <Icon icon="twitter" fw={true} />
              <span className="gray-2">Tweet</span>
            </a>

            <a href="javascript:void(0);" className="mr1 gray-2" onClick={this.handleFacebookClick} key="facebook-button">
              <Icon icon="facebook" fw={true} />
              <span className="gray-2">Share</span>
            </a>

            <a href="javascript:void(0);" className="mr1 gray-2" onClick={this.handleGooglePlusClick} key="google-button">
              <Icon icon="google-plus" fw={true} />
              <span className="gray-2">Plus</span>
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
    return this[this.props.size]();
  },


  shortUrl() {
    var idea = this.props.idea;
    var path = idea.path;

    return SHORT_HOST + path;
  },

  small() {
    return (
      <div className="clearfix bg-gray-6 center">
        <a href="javascript:void(0);" onClick={this.handleTwitterClick}>
          <CircleIcon icon="twitter" />
        </a>

        <a href="javascript:void(0);" onClick={this.handleFacebookClick}>
          <CircleIcon icon="facebook" />
        </a>

        <a href="javascript:void(0);" onClick={this.handleGooglePlusClick}>
          <CircleIcon icon="google-plus" />
        </a>

        <a href="javascript:void(0);" onClick={this.handleCopyClick} ref="copy">
          <CircleIcon icon={this.state.copyIcon} />
        </a>
      </div>
    );
  }
});

module.exports = IdeaSharePanel;

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
