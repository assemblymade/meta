class ChoicesController < ProductController
  respond_to :html, :json

  def index

  end

  def create

    #USE CURRENT USER
    @voter = current_user
    @proposal = Proposal.find(params[:proposal])

    if !@proposal.user_vote_status(@voter)
      weight = @proposal.user_weight(@voter)
      type = ""
      @proposal.choices.create!({
        value: 1.0,  #binary for YES
        weight: weight,
        type: type,
        user: @voter
        })
    else
      @proposal.choices.where(user: @voter).delete_all
    end
    @proposal.update_state
    @proposal.reload

    render json: {
      progress: @proposal.status,
      approved: @proposal.user_vote_status(current_user),
      state: @proposal.state
    }

  end

  def destroy
  end

  def update
  end

end
