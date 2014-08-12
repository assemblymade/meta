module ReadRaptor
  class RegisterArticleWorker
    include Sidekiq::Worker
    include ReadRaptor::Client

    def perform(args)
      post "/articles", args
    end
  end
end
