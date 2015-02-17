var CONSTANTS = require('../constants');
var TagListStore = require('../stores/tag_list_store');
var TAG_STYLES = require('../lib/github_colors');

var TC = CONSTANTS.TYPEAHEAD;
var TAG_LIST = CONSTANTS.TAG_LIST;

var TagList = React.createClass({
  propTypes: {
    destination: React.PropTypes.bool,
    hideAddButton: React.PropTypes.bool,
    newBounty: React.PropTypes.bool,
    tags: React.PropTypes.array,
    url: React.PropTypes.string
  },

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
    };
  },

  getInitialState: function() {
    return {
      adding: false,
      popoverShown: false,
      // :<
      tags: this.props.tags
    };
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
        }
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
                className="btn btn-link btn-sm">
              {this.tagPopoverText()}
            </a>
          </BsPopover>
        </li>
      );
    }
  },

  removeButton: function(tag) {
    if (this.props.destination && !this.props.hideAddButton) {
      return (
        <span className="remove" onClick={this.removeTag(tag)}>
          &times;
        </span>
      );
    }

    return null;
  },

  removeTag: function(tag) {
    var self = this;

    return function(e) {
      e.stopPropagation();
      e.preventDefault();

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
      <ul className="list-inline">
        {this.tags(this.state.tags)}
        {this.popoverButton()}
      </ul>
    );
  },

  suggestedTags: function() {
    return (
      <div style={{ textAlign: 'center' }}>
        <TagList
            destination={false}
            url={this.props.url}
            tags={window.app.suggestedTags()} />
        <hr />
        <TextInput
            url={this.props.url}
            label="Custom tag"
            width="120px"
            prompt="+"
            size="small" />
      </div>
    );
  },

  tagPopoverText: function() {
    if (this.props.newBounty || this.props.hideAddButton) {
      return null;
    }

    return this.state.popoverShown ? 'Hide' : 'Add tag';
  },

  tags: function(tags) {

    var self = this;
    var addedTags = TagListStore.getTags();

    var mappedTags = _.map(tags, function(tag, i) {
      if (!tag) {
        return;
      }

      var style = {};

      if (!self.props.destination && addedTags && addedTags.indexOf(tag) >= 0) {
        style.cursor = 'default';
      }

      var backgroundColor = TAG_STYLES[tag.toLowerCase()];

      if (backgroundColor) {
        style.borderLeft = '4px solid ' + backgroundColor;
      }

      return (
        <li key={tag + '-' + i} style={{ margin: '10px 0 0 0' }}>
          <a style={style}
              className="tag"
              href={self.props.filterUrl && self.props.destination ?
                self.props.filterUrl + '?tag=' + tag :
                'javascript:void(0);'}
              onClick={self.handleClick(tag)}>
            {tag}
            {self.removeButton(tag)}
          </a>
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
        <li key="no_tags" style={{ color: '#333', fontSize: '13px' }}>
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

module.exports = window.TagList = TagList;
