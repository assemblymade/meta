module ReadRaptor
  class RegisterArticleWorker < ActiveJob::Base
    queue_as :default
    
    include ReadRaptor::Client

    def perform(args)
      post "/articles", args
    end
  end
end
