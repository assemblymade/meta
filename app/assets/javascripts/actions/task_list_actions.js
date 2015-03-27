const NewsFeedItemStore = require('../stores/news_feed_item_store')
const Routes = require('../routes')
const WebUtil = require('../web_util')

module.exports = {
  updateTask(index, taskItem, checked) {
    let id = NewsFeedItemStore.getItem().id
    WebUtil.patch(
      Routes.news_feed_item_update_task_path({news_feed_item_id: id}),
      { "op": "check", "index": index, "task_item": taskItem, "checked": checked }
    )
  }
}
