class ChoicesController < ProductController
  respond_to :html, :json
  skip_before_filter  :verify_authenticity_token

  def index

  end

  def create
    @current_user = User.find(params[:voter])
    @proposal = Proposal.find(params[:proposal])
    @weight = params[:weight]

    if @current_user.can_vote?(@proposal.product)
      if !@proposal.user_vote_status(@current_user)
        weight = @proposal.user_weight(@current_user)
        type = ""
        Choice.create!({
          value: 1.0,  #binary for YES
          weight: weight,
          type: type,
          proposal: @proposal,
          user: @current_user
          })
      else
        @proposal.choices.where(user: @current_user).delete_all
      end
    end

    redirect_to :back

  end

  def destroy
  end

  def update
  end

end
