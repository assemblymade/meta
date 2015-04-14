'use strict';

const ActionTypes = require('../constants').ActionTypes;
const Dispatcher = require('../dispatcher');
const ATTACHMENT_URL = '/upload/attachments';

class ScreenshotActions {
  deleteScreenshot(url) {
    $.ajax({
      url: url,
      dataType: 'json',
      method: 'DELETE',
      success(response) {
        Dispatcher.dispatch({
          type: ActionTypes.SCREENSHOT_DELETED,
          id: response.id
        });
      }
    });
  }

  handleSuccess() {
    Dispatcher.dispatch({
      type: ActionTypes.SCREENSHOT_SUCCESS
    });
  }

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

      success: function(screenshot) {
        done();

        Dispatcher.dispatch({
          type: ActionTypes.SCREENSHOT_UPLOADED,
          screenshot: screenshot
        });
      }
    });
  }
}

function _upload(url, file, done) {
  Dispatcher.dispatch({
    type: ActionTypes.SCREENSHOT_UPLOADING
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

module.exports = new ScreenshotActions();
