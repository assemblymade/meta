# This is a temporary proxy to readraptor until javascript clients can talk directly to RR
class ReadraptorController < ApplicationController
  def show
    reader_ids = []
    if article = ReadRaptorClient.new.get("/articles/#{params.fetch(:id)}")
      reader_ids = article['delivered']
    end

    render json: {
      read_by: User.where(id: reader_ids).pluck(:username)
    }
  end
end