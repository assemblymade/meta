module ReadRaptor
  class ReadArticle < ActiveJob::Base
    queue_as :default
    
    include ReadRaptor::Client

    def perform(url)
      get url
    end
  end
end
