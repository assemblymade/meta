class ChoicesController < ProductController
  respond_to :html, :json

  def index

  end

  def create

    #USE CURRENT USER
    @voter = current_user
    @proposal = Proposal.find(params[:proposal])

    if @voter.can_vote?(@proposal.product)
      if !@proposal.user_vote_status(@voter)
        weight = @proposal.user_weight(@voter)
        type = ""
        Choice.create!({
          value: 1.0,  #binary for YES
          weight: weight,
          type: type,
          proposal: @proposal,
          user: @voter
          })
      else
        @proposal.choices.where(user: @voter).delete_all
      end
    end

    render json: {
      progress: @proposal.status,
      approved: @proposal.user_vote_status(current_user)
    }

  end

  def destroy
  end

  def update
  end

end
