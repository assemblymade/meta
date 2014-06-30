/** @jsx React.DOM */

//= require constants
//= require stores/tag_list_store

var TC = CONSTANTS.TEXT_COMPLETE;
var TAG_LIST = CONSTANTS.TAG_LIST;

var TagList = React.createClass({
  getInitialState: function() {
    return {
      tags: this.props.tags
    }
  },

  componentWillMount: function() {
    if (this.props.destination) {
      TagListStore.setTags(this.props.tags);
    }
  },

  render: function() {
    return (
      <ul className="list-inline omega">
        {this.tags(this.state.tags)}
      </ul>
    );
  },

  tags: function(tags) {
    var self = this;

    return _.map(tags, function(tag) {
      var addedTags = TagListStore.getTags();
      var style = {
        'font-size': '14px',
        cursor: 'pointer'
      };

      if (!self.props.destination && addedTags.indexOf(tag) >= 0) {
        style.cursor = 'default';
        style.color = '#d3d3d3';
      }

      if (!tag) {
        return;
      }

      return (
        <li style={{'margin': '0px'}}>
          <a style={style} onClick={self.handleClick(tag)}>{tag}</a>
        </li>
      );
    });
  },

  componentDidMount: function() {
    TagListStore.addChangeListener(TC.EVENTS.TAG_ADDED + '-' + this.props.destination.toString(), this.onChange);
    TagListStore.addChangeListener(TAG_LIST.EVENTS.TAG_REMOVED, this.onChange);
  },

  onChange: function() {
    if (this.props.destination) {
      this.setState({
        tags: TagListStore.getTags()
      });

      var tagListHack = $('#tag-list-hack');

      if (tagListHack.length) {
        var selected = tagListHack.val();

        $(tagListHack).append(_.map(TagListStore.getTags(), function(tag) {
          if ((selected && selected.indexOf(tag) === -1) || !selected) {
            return '<option value=' + tag + ' selected="true">' + tag + '</option>';
          }
        }));
      }
    } else {
      this.setState({
        tags: this.props.tags
      });
    }
  },

  handleClick: function(tag) {
    var self = this;

    if (this.props.destination) {
      return function(e) {

        Dispatcher.dispatch({
          action: TAG_LIST.ACTIONS.REMOVE_TAG,
          data: { tag: tag, url: self.props.url },
          event: TAG_LIST.EVENTS.TAG_REMOVED
        });
      };
    }

    return function(e) {
      Dispatcher.dispatch({
        action: TAG_LIST.ACTIONS.ADD_TAG,
        data: { tag: tag, url: self.props.url },
        event: TAG_LIST.EVENTS.TAG_ADDED + '-true'
      });

      self.setState({
        tags: self.state.tags
      });
    };
  }
});
