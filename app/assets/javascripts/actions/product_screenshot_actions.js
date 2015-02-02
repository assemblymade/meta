const ActionTypes = window.CONSTANTS.ActionTypes;
const Dispatcher = window.Dispatcher;
const ATTACHMENT_URL = '/upload/attachments';

class ProductScreenshotActions {
  uploadScreenshot(url) {
    return function(file, done) {
      _upload(url, file, done);
    };
  }
};

function _success(url, file, done) {
  return function(attachment) {
    file.attachment = attachment;
    file.form = attachment.form;

    $.ajax({
      url: url,
      method: 'POST',
      dataType: 'json',
      data: {
        asset: {
          name: file.name,
          attachment_id: attachment.id
        }
      },

      success: function(product) {
        Dispatcher.dispatch({
          type: ActionTypes.PRODUCT_RECEIVE,
          product: product
        });

        Dispatcher.dispatch({
          type: ActionTypes.PRODUCT_SCREENSHOT_UPLOADED,
        });

        done();
      }
    });
  }
}

function _upload(url, file, done) {
  Dispatcher.dispatch({
    type: ActionTypes.PRODUCT_SCREENSHOT_UPLOADING
  });

  $.ajax({
    url: ATTACHMENT_URL,
    method: 'POST',
    dataType: 'json',
    data: {
      name: file.name,
      content_type: file.type,
      size: file.size
    },
    success: _success(url, file, done),

    error: function(jqXhr, textStatus, err) {
      done(err);
    }
  });
}

module.exports = new ProductScreenshotActions();
