class Governance

  def create_vesting_proposal(author_user, product, total_coins, intervals, start_date, expiration_date, name, description, proposal_duration, recipient_user)
    the_proposal = Proposal.create!({
      name: name, description: description, expiration: Time.now + proposal_duration, contract_type: "vesting", state: "open", user: author_user, product: product
      })

    new_vesting = Vesting.create!({
      proposal: the_proposal,
      start_date: start_date,
      expiration_date: expiration_date,
      intervals: intervals,
      intervals_paid: 0,
      coins: total_coins,
      user: recipient_user,
      state: "unconfirmed",
      product: product
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
