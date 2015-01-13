var Spinner = require('../spinner.js.jsx');

var IdeaScrim = React.createClass({
  displayName: 'IdeaScrim',

  render: function () {
    var absoluteCenter = {
      margin: 'auto',
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      height: 100,
      zIndex: 100
    };

    var scrim = {
      margin: 'auto',
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      height: window.innerHeight,
      backgroundColor: '#333',
      opacity: 0.5,
      zIndex: 99
    };

    return (
      <div style={{ display: 'block', height: window.innerHeight }}>
        <div style={absoluteCenter} key="spinner">
          <Spinner />
        </div>
        <div style={scrim} key="scrim" />
        {this.props.children}
      </div>
    );
  }
});

module.exports = IdeaScrim;
