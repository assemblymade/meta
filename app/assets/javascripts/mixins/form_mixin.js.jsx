/** @jsx React.DOM */

(function(){
  var FormMixin = {
    getInitialState: function() {
      return {
        errors: [],
        submitting: false
      }
    },

    handleSubmit: function(e) {
      e.preventDefault()
      this.setState({submitting: true})

      $.ajax({
        url: this.props.url,
        dataType: 'json',
        type: 'POST',
        data: $(e.target).serialize(),
        success: function(data) {
          this.setState({submitting: false})
          this.onFormSuccess(data)
        }.bind(this),
        error: function(xhr, status, err) {
          this.setState({submitting: false})
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
