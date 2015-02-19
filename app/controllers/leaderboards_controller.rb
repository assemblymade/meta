class LeaderboardsController < ApplicationController

  respond_to :json, :html

  def index

    rank_data = LeaderDetermination.new.assemble_rank_data

    render json: rank_data

  end

end
