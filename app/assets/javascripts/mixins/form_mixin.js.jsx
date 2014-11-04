/** @jsx React.DOM */

(function(){
  var FormMixin = {
    getInitialState: function() {
      return {
        errors: []
      }
    },

    handleSubmit: function(e) {
      e.preventDefault()

      $.ajax({
        url: this.props.url,
        dataType: 'json',
        type: 'POST',
        data: $(e.target).serialize(),
        success: function(data) {
          this.onFormSuccess(data)
        }.bind(this),
        error: function(xhr, status, err) {
          if (xhr.responseJSON && xhr.responseJSON.errors) {
            this.handleErrors(xhr.responseJSON.errors)
          }
        }.bind(this)
      })
    },

    handleErrors: function(errors) {
      this.setState({ errors: errors })
    }
  }

  if (typeof module !== 'undefined') {
    module.exports = FormMixin
  }

  window.FormMixin = FormMixin
})()
