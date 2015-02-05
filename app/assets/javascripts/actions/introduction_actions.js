const ActionTypes = require('../constants').ActionTypes;
const Dispatcher = require('../dispatcher');
const Routes = require('../routes');

let IntroductionActions = {
  submitIntroduction(productSlug, userId, introduction) {
    let url = Routes.product_person_path({
      product_id: productSlug,
      id: userId
    });

    $.ajax({
      url: url,
      method: 'PATCH',
      dataType: 'json',
      data: {
        membership: {
          bio: introduction
        }
      },

      success(membership) {
        Dispatcher.dispatch({
          type: ActionTypes.INTRODUCTION_RECEIVE,
          introduction: membership.bio
        });
      }
    });
  },

  updateIntroduction(introduction) {
    Dispatcher.dispatch({
      type: ActionTypes.INTRODUCTION_UPDATE,
      introduction: introduction
    });
  }
};

module.exports = IntroductionActions;
