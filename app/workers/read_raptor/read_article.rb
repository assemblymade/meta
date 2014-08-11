module ReadRaptor
  class ReadArticle
    include Sidekiq::Worker

    def perform(url)
      get url
    end
  end
end
