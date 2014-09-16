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

    componentWillUnmount: function() {
      TagListStore.removeChangeListener(this.onChange);
    },

    getDefaultProps: function() {
      return {
        tags: []
      }
    },

    getInitialState: function() {
      return {
        adding: false,
        popoverShown: false,
        removeTagVisibility: 'hidden',
        tags: this.props.tags
      }
    },

    handleClick: function(tag) {
      var self = this;

      return function(e) {
        e.stopPropagation();

        Dispatcher.dispatch({
          action: TAG_LIST.ACTIONS.ADD_TAG,
          data: {
            tag: tag,
            url: self.props.url
          },
        });

        self.setState({
          tags: self.state.tags
        });
      };
    },

    handleHide: function() {
      this.setState({
        popoverShown: false
      });
    },

    hideRemoveTag: function(e) {
      this.setState({
        removeTagVisibility: 'hidden'
      });
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

    popoverButton: function() {
      if (this.props.destination &&
          !this.props.newBounty &&
          this.state.tags.length > 0 &&
          this.state.tags[this.state.tags.length - 1] !== '') {

        return (
          <li>
            <BsPopover
                content={this.suggestedTags()}
                placement="bottom"
                visible={this.state.popoverShown}
                onHide={this.handleHide}>
              <a
                  href="javascript:"
                  onClick={this.togglePopover}
                  className="btn btn-default btn-sm">
                {this.tagPopoverText()}
              </a>
            </BsPopover>
          </li>
        );
      }
    },

    removeButton: function(tag) {
      if (this.props.destination) {
        return (
          <span>
            <a style={{
                  'margin-left': '2px',
                  'font-size': '10px',
                  cursor: 'pointer',
                  visibility: this.state.removeTagVisibility
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
          data: {
            tag: tag,
            url: self.props.url
          },
        });
      };
    },

    render: function() {
      return (
        <ul className="list-inline omega">
          {this.tags(this.state.tags)}
          {this.popoverButton()}
        </ul>
      );
    },

    showRemoveTag: function(e) {
      this.setState({
        removeTagVisibility: 'visible'
      });
    },

    suggestedTags: function() {
      return (
        <div style={{ 'text-align': 'center' }}>
          <TagList
              destination={false}
              url={this.props.url}
              tags={window.app.suggestedTags()} />
          <hr />
          <TextInput
              url={this.props.url}
              label="Custom tag"
              width="80px"
              prompt="+"
              size="small" />
        </div>
      );
    },

    tagPopoverText: function() {
      if (this.props.newBounty) {
        return null;
      }

      return this.state.popoverShown ? 'Hide' : 'Add tag';
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
          <li
              key={tag}
              style={{'margin': '0px'}}
              onMouseOver={self.showRemoveTag}
              onMouseOut={self.hideRemoveTag}>
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
          !this.props.newBounty &&
          (_.isEmpty(mappedTags) ||
            (mappedTags[0] == undefined &&
             mappedTags[1] == undefined))) {
        return (
          <li style={{color: '#d3d3d3', 'font-size': '13px'}}>
            <BsPopover
                content={this.suggestedTags()}
                placement="bottom"
                visible={this.state.popoverShown}
                onHide={this.handleHide}>
              <span>
                No tags yet &mdash; why not <a href="javascript:void(0);" onClick={this.togglePopover}>add some</a>?
              </span>
            </BsPopover>
          </li>
        );
      }

      return mappedTags;
    },

    togglePopover: function(e) {
      this.setState({
        popoverShown: !this.state.popoverShown
      });
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = TagList;
  }

  window.TagList = TagList;
})();
