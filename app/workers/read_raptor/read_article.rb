module ReadRaptor
  class ReadArticle
    include Sidekiq::Worker
    include ReadRaptor::Client

    def perform(url)
      get url
    end
  end
end
