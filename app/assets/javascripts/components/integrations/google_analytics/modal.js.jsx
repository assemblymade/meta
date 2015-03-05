

(function() {
  var FormGroup = require('../../form_group.js.jsx');
  var Lightbox = require('../../lightbox.js.jsx');

  module.exports = React.createClass({
    displayName: 'GoogleAnalyticsModal',
    propTypes: {
      onHidden: React.PropTypes.func.isRequired
    },

    componentDidMount: function() {
      var modal = $(this.getDOMNode()).modal({ show: true });

      modal.on('hidden.bs.modal', this.props.onHidden);
    },

    componentWillUnmount: function() {
      $(this.getDOMNode()).off('hidden.bs.modal');
    },

    getDefaultProps: function() {
      var csrfTokenElement = document.getElementsByName('csrf-token')[0];

      if (csrfTokenElement) {
        return {
          csrf: csrfTokenElement.content
        };
      }
    },

    getInitialState: function() {
      return {
        account: this.props.initialAccount || '',
        profile: this.props.initialProfile || '',
        property: this.props.initialProperty || ''
      };
    },

    handleChange: function(type, e) {
      var state = {};
      state[type] = e.target.value;

      this.setState(state);
    },

    render: function() {
      var url = '/' + this.props.product.slug + '/integrations/google/update';

      return (
        <Lightbox title="Google Analytics Configuration">
          <form action={url} method="post" name="integration[config]">
            <div className="modal-body">
              <div className="hide">
                <input name="authenticity_token" type="hidden" value={this.props.csrf} />
                <input name="_method" value="put" type="hidden" />
              </div>

              <FormGroup>
                <label className="form-label">Account Name</label>
                <input type="text"
                    name="integration[config[account_name]]"
                    className="form-control"
                    onChange={this.handleChange.bind(this, 'account')}
                    value={this.state.account}
                    placeholder="The name of the Google Analytics account you're using." />
              </FormGroup>

              <FormGroup>
                <label className="form-label">Web Property Name</label>
                <input type="text"
                    name="integration[config[property_name]]"
                    className="form-control"
                    onChange={this.handleChange.bind(this, 'property')}
                    value={this.state.property}
                    placeholder="The name of the Google Analytics web property you're using." />
              </FormGroup>


              <FormGroup>
                <label className="form-label">Profile Name</label>
                <input type="text"
                    name="integration[config[profile_name]]"
                    className="form-control"
                    onChange={this.handleChange.bind(this, 'profile')}
                    value={this.state.profile}
                    placeholder="The name of the Google Analytics web profile you're using." />
              </FormGroup>
            </div>

            <div className="modal-footer form-actions">
              <button type="button" className="btn btn-default" data-dismiss="modal">Cancel</button>
              <button className="btn btn-primary" name="button" type="submit">Save</button>
            </div>
          </form>
        </Lightbox>
      );
    },

    save: function(e) {

      var data = {
        integration: {
          config: {
            account_name: this.state.account,
            profile_name: this.state.profile,
            property_name: this.state.property
          }
        }
      };

      var self = this;

      window.xhr.jsonPut(url, data, function(err, response) {
        if (err) {
          return console.error(err);
        }

        $(self.getDOMNode()).modal('hide');
      });
    }
  });
})();
