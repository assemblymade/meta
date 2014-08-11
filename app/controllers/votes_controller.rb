class VotesController < ApplicationController
  respond_to :html, :json

  before_action :authenticate_user!, :only => [:create, :show, :downvote]
  before_action :set_voteable, :only => [:create, :downvote]

  def create
    @vote = @voteable.upvote!(current_user, request.remote_ip)

    AsmMetrics.active_user(current_user) unless current_user.staff?
    respond_with @vote, location: product_path(@product)
  end

  def downvote
    if @voteable.downvotable?
      @voteable.votes.by_user(current_user).destroy_all
      TransactionLogEntry.voted!(Time.current, @voteable.product, @voteable.id, current_user.id, -1)
      AsmMetrics.active_user(current_user) unless current_user.staff?
    end

    render nothing: true, status: 200
  end

  def show
    @product = Product.find_by_id_or_slug!(params.fetch(:product_id)).decorate
  end

  def set_voteable
    case
    when params[:wip_id]
      @product = Product.find_by!(slug: params[:product_id]).decorate
      wip_number = Integer(params[:wip_id]) rescue nil
      @voteable = if wip_number
        @product.wips.find_by!(number: wip_number)
      else
        @product.work.find(params[:wip_id])
      end

    when params[:product_id]
      @voteable = Product.find_by_id_or_slug!(params[:product_id])
    end
  end
end
