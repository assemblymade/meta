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




end
