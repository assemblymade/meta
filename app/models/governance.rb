class Governance

  def create_vesting_proposal(params)
    the_proposal = Proposal.create!({
      name: params.name, description: params.description, expiration: Time.now + params.proposal_duration, contract_type: "vesting", state: "open", user: params.author_user, product: params.product
      })

    new_vesting = Vesting.create!({
      proposal: the_proposal,
      start_date: params.start_date,
      expiration_date: params.expiration_date,
      intervals: params.intervals,
      intervals_paid: 0,
      coins: params.total_coins,
      user: params.recipient_user,
      state: "unconfirmed",
      product: params.product
      })
    the_proposal.vestings.append(new_vesting)
  end

  def enforce_all
    proposals = Proposal.where(state: "active")
    proposals.each do |p|
      if not p.expired?
        p.enforce
        Rails.logger.info "Enforcing Proposal #{p.name}"
      end
    end
  end


end
