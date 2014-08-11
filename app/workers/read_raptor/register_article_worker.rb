module ReadRaptor
  class RegisterArticleWorker
    include Sidekiq::Worker

    def perform(args)
      post "/articles", args
    end
  end
end
