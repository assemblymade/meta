/** @jsx React.DOM */

var CONSTANTS = require('../constants');
var TagListStore = require('../stores/tag_list_store');

(function() {
  var TC = CONSTANTS.TYPEAHEAD;
  var TAG_LIST = CONSTANTS.TAG_LIST;

  var TagList = React.createClass({
    componentWillMount: function() {
      if (this.props.destination) {
        TagListStore.setTags(this.props.tags);
      }

      TagListStore.addChangeListener(this.onChange);
    },

    getDefaultProps: function() {
      return {
        tags: []
      }
    },

    getInitialState: function() {
      return {
        tags: this.props.tags
      }
    },

    handleClick: function(tag) {
      var self = this;

      return function(e) {
        e.preventDefault();

        Dispatcher.dispatch({
          action: TAG_LIST.ACTIONS.ADD_TAG,
          data: { tag: tag, url: self.props.url },
        });

        self.setState({
          tags: self.state.tags
        });
      };
    },

    onChange: function() {
      var tags = TagListStore.getTags();

      if (this.props.destination) {
        this.setState({
          tags: tags
        });

        var tagListHack = $('#tag-list-hack');

        if (tagListHack.length) {
          if (_.isEmpty(tags)) {
            tagListHack.empty();
          }

          var selected = tagListHack.val();

          $(tagListHack).append(_.map(tags, function(tag) {
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

    removeButton: function(tag) {
      if (this.props.destination) {
        return (
          <span>
            <a style={{
                  'margin-left': '2px',
                  'font-size': '10px',
                  cursor: 'pointer'
                }}
                onClick={this.removeTag(tag)}>
              &times;
            </a>
          </span>
        );
      }

      return null;
    },

    removeTag: function(tag) {
      var self = this;

      return function(e) {
        Dispatcher.dispatch({
          action: TAG_LIST.ACTIONS.REMOVE_TAG,
          data: { tag: tag, url: self.props.url },
        });
      };
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
      var addedTags = TagListStore.getTags();

      var mappedTags = _.map(tags, function(tag) {
        var style = {
          'font-size': '14px',
          cursor: 'pointer'
        };

        if (!self.props.destination && addedTags && addedTags.indexOf(tag) >= 0) {
          style.cursor = 'default';
          style.color = '#d3d3d3';
        }

        if (!tag) {
          return;
        }

        return (
          <li style={{'margin': '0px'}}>
            <a style={style}
                href={self.props.filterUrl && self.props.destination ?
                  self.props.filterUrl + '?tag=' + tag :
                  'javascript:void(0);'}
                onClick={self.handleClick(tag)}>
              {tag}
            </a>
            {self.removeButton(tag)}
          </li>
        );
      });

      // FIXME: When there are no tags, the client just receives [""], which requires weird checks like this.
      if (this.props.destination &&
          (_.isEmpty(mappedTags) ||
            (mappedTags[0] == undefined &&
             mappedTags[1] == undefined))) {
        return (
          <li key="no-tags" style={{color: '#d3d3d3', 'font-size': '13px'}}>No tags yet &mdash; why not add some?</li>
        );
      }

      return mappedTags;
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = TagList;
  }

  window.TagList = TagList;
})();
