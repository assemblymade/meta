class SlackhookWorker < WebhookWorker
  def perform(request_data = {})
    post "https://hooks.slack.com/services/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",
      request_data
  end
end
