const ActionTypes = require('../constants').ActionTypes;
const Dispatcher = require('../dispatcher');
const Immutable = require('immutable');
const Routes = require('../routes');

class ProductSubsectionActions {
  editSubsection(title) {
    Dispatcher.dispatch({
      type: ActionTypes.PRODUCT_SUBSECTION_EDITING,
      title: title
    });
  }

  submitSubsections(productSlug, subsections) {
    let url = Routes.product_path({
      id: productSlug
    });

    if (_.isEmpty(subsections)) {
      subsections = null;
    }

    $.ajax({
      url: url,
      method: 'PATCH',
      dataType: 'json',
      data: {
        subsections: subsections
      },

      success: function(data) {
        // 204
        Dispatcher.dispatch({
          type: ActionTypes.PRODUCT_SUBSECTIONS_SUBMITTED,
          subsections: subsections
        });
      },

      error: function err(jqXhr, textStatus, e) {
        console.log(e);
      }
    });
  }
};

module.exports = new ProductSubsectionActions();
