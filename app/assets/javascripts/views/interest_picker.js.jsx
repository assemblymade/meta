/** @jsx React.DOM */

//= require constants
//= require dispatcher
//= require stores/interest_store

;(function() {
  var IP = CONSTANTS.INTEREST_PICKER;

  var keys = {
    enter: 13,
    esc: 27,
    up: 38,
    down: 40,
    delete: 8
  };

  window.InterestPicker = React.createClass({
    getInitialState: function() {
      return {
        selectedInterests: InterestStore.getInterests(),
        highlightIndex: 0,
        visibleInterests: [],
        userInput: ''
      };
    },

    componentWillMount: function() {
      if (this.props.userInterests && this.props.userInterests.length) {
        InterestStore.setInterests(this.props.userInterests);
      }

      InterestStore.addChangeListener(IP.EVENTS.INTEREST_ADDED, this.onStoreChange);
      InterestStore.addChangeListener(IP.EVENTS.INTEREST_REMOVED, this.onStoreChange);
      InterestStore.addChangeListener(IP.EVENTS.POPPED, this.onStoreChange);
    },

    render: function() {
      return (
        <div style={{ position: 'relative', cursor: 'text' }}>
          <select
              name={this.props.name}
              multiple='true'
              style={{ display: 'none' }}
              value={this.state.selectedInterests}>
            {this.formatSelected('option')}
          </select>
          <ul
              className='pill-list'
              ref='container'
              onClick={this.handleContainerClick}>
            {this.formatSelected('pill')}
            <li>
              <input
                  type='text'
                  ref='userInput'
                  onChange={this.handleChange}
                  onKeyDown={this.handleKeyDown}
                  onFocus={this.handleFocus}
                  onBlur={this.handleBlur}
                  value={this.state.userInput}
              />
            </li>
          </ul>
          { this.state.visibleInterests.length > 0 && this.state.show ? this.interestDropdown() : null }
        </div>
      );
    },

    interestDropdown: function() {
      return (
        <InterestDropdown
            interests={this.state.visibleInterests}
            highlightIndex={this.state.highlightIndex}
            onInterestSelected={this.onInterestSelected}
        />
      );
    },

    handleContainerClick: function(e) {
      e.preventDefault();
      this.refs.userInput.getDOMNode().focus();
    },

    handleChange: function(e) {
      var value = e.target.value;
      var visibleInterests = this.getVisibleInterests(value);

      this.setState({
        userInput: this.transform(value),
        visibleInterests: visibleInterests
      });
    },

    handleKeyDown: function(e) {
      if (e.keyCode === keys.up) {
        e.preventDefault();
        this.moveHighlight(-1);
      } else if (e.keyCode === keys.down) {
        e.preventDefault();
        this.moveHighlight(1);
      } else if (e.keyCode === keys.delete) {
        if (this.state.userInput === '') {
          return Dispatcher.dispatch({
            action: IP.ACTIONS.POP,
            event: IP.EVENTS.POPPED
          });
        }
      } else if (e.keyCode === keys.enter) {
        e.preventDefault();
        this.selectCurrentInterest();
      }
    },

    getVisibleInterests: function(value) {
      var interests = _.filter(this.props.interests, function(interest) {
        return interest.indexOf(value) >= 0 && InterestStore.getInterests().indexOf(interest) === -1;
      });

      if (value && interests.indexOf(value) === -1) {
        interests.push(value);
      }

      return interests;
    },

    moveHighlight: function(inc) {
      var index = this.constrainHighlight(this.state.highlightIndex + inc);

      this.setState({
        highlightIndex: index
      });
    },

    constrainHighlight: function(index) {
      return Math.max(
        0, Math.min(this.state.visibleInterests.length - 1, index)
      );
    },

    selectCurrentInterest: function() {
      Dispatcher.dispatch({
        action: IP.ACTIONS.ADD_INTEREST,
        event: IP.EVENTS.INTEREST_ADDED,
        data: this.state.visibleInterests[this.state.highlightIndex]
      });
    },

    onStoreChange: function() {
      this.setState({
        visibleInterests: [],
        selectedInterests: InterestStore.getInterests(),
        userInput: ''
      });
    },

    transform: function(text) {
      return text.replace(/[^\w-]+/g, '-').toLowerCase();
    },

    handleFocus: function(e) {
      this.refs.container.getDOMNode().style.cssText = "border: 1px solid #48a3ed; box-shadow: 0px 0px 3px #66afe9";

      this.setState({
        show: true,
        visibleInterests: _.difference(this.props.interests, InterestStore.getInterests())
      });
    },

    handleBlur: function(e) {
      this.refs.container.getDOMNode().style.cssText = '';

      var self = this;

      // FIXME: There has to be a better way to handle this:
      //        The issue is that hiding the dropdown on blur
      //        causes selecting an item to fail without a
      //        timeout of ~200 to ~300 ms.
      setTimeout(function() {
        self.setState({
          show: false
        });
      }, 300);
    },

    onInterestSelected: function(e) {
      Dispatcher.dispatch({
        action: IP.EVENTS.ADD_INTEREST,
        event: IP.EVENTS.INTEREST_ADDED,
        data: ''
      });
    },

    handleRemove: function(interest) {
      Dispatcher.dispatch({
        action: IP.ACTIONS.REMOVE_INTEREST,
        event: IP.EVENTS.INTEREST_REMOVED,
        data: interest
      });
    },

    formatSelected: function(optionOrPill) {
      var interests = InterestStore.getInterests();
      var selectedInterests = _.map(interests, this.interestTo[optionOrPill].bind(this));

      return selectedInterests;
    },

    interestTo: {
      option: function(interest) {
        return <option value={interest} key={interest}>{interest}</option>
      },

      pill: function(interest) {
        return (
          <li className='interest-choice' key={interest}>
            <a className='interest-close' onClick={this.handleRemove.bind(this, interest)}>@{interest} &times;</a>
          </li>
        );
      }
    }
  });

  var InterestDropdown = React.createClass({
    render: function() {
      var style = {
        position: 'absolute',
        'z-index': 100,
        top: 45,
        left: 0,
        width: '100%',
        display: 'block'
      };

      return (
        <ul className="dropdown-menu" style={style}>
          {this.rows()}
        </ul>
      );
    },

    rows: function() {
      var i = -1;

      var interests = _.map(this.props.interests, function(interest) {
        i++;

        return (
          <InterestDropdownEntry
              key={interest}
              interest={interest}
              selected={i === this.props.highlightIndex}
          />
        );
      }.bind(this));

      return interests;
    }
  });

  var InterestDropdownEntry = React.createClass({
    render: function() {
      var interest = this.props.interest;
      var className = 'textcomplete-item';

      if (this.props.selected) {
        className += ' active';
      }

      return (
        <li className={className}>
          <a href={'#@' + interest} style={{ cursor: 'pointer' }} onClick={this.handleInterestSelected.bind(this, interest)}>
            @{this.props.interest}
          </a>
        </li>
      );
    },

    handleInterestSelected: function(interest) {
      Dispatcher.dispatch({
        action: IP.ACTIONS.ADD_INTEREST,
        event: IP.EVENTS.INTEREST_ADDED,
        data: interest
      });
    }
  });
})();
