module Karma
  class Kalkulate

    FOUNDER_BOUNTY_MULTIPLER = 0.05
    BOUNTY_KARMA_VALUE = 10.0
    BOUNTY_CREATOR_KARMA_SHARE = 0.3 #30%
    KARMA_FROM_INVITE = 2.0
    KARMA_FROM_COMPLETED_INVITE = 10.0

    def get_chronicle_id(user_id)
      chronicle = Chronicle.find_by(user_id: user_id)
      if not chronicle.nil?
        chronicle_id = chronicle.id
      else
        chronicle = Chronicle.create!(user_id: user_id)
        chronicle_id = chronicle.id
      end
      return chronicle_id
    end

    def karma_from_product_founding(product)
      kumulative_karma = 1.0  #starting karma
      #founder = User.find_by(product.user_id)
      product_bounties_n = product.tasks.won.count
      kumulative_karma = kumulative_karma + FOUNDER_BOUNTY_MULTIPLER * product_bounties_n
      return kumulative_karma
    end



    def karma_from_invite(invite)
      recipient_id = invite.invitor_id
      chronicle_id = get_chronicle_id(recipient_id)
      Deed.create!({karma_value: KARMA_FROM_INVITE, karma_event: invite, user_id: recipient_id, chronicle_id: chronicle_id})
    end

    def karma_from_bounty_creation_after_completion(the_wip, author_id)
      user_id = author_id
      chronicle_id = get_chronicle_id(user_id)
      Deed.create!({karma_value: BOUNTY_KARMA_VALUE*BOUNTY_CREATOR_KARMA_SHARE, karma_event: the_wip, user_id: author_id, chronicle_id: chronicle_id})
    end


    def wip_done_by_invitee(the_wip, rewarded_user_id)
      relevant_invite = Invite.where(via_id: the_wip.id).where(invitee_id: rewarded_user_id)

      if relevant_invite.count > 0 #not empty
        #there should only ever be one invite per user/product pair
        relevant_invite = relevant_invite.first
        invitor_id = relevant_invite.invitor_id
        chronicle_id = get_chronicle_id(invitor_id)
        Deed.create!({karma_value: KARMA_FROM_COMPLETED_INVITE, karma_event: relevant_invite, user_id: invitor_id, chronicle_id: chronicle_id})
      end
    end


    def karma_from_bounty_completion(the_wip, user_id)
      chronicle_id = get_chronicle_id(user_id)

      Deed.create!({karma_value: BOUNTY_KARMA_VALUE, karma_event: the_wip, user_id: user_id, chronicle_id: chronicle_id})

      #CHECK IF THIS WAS AN INVITE, reward invitor if YES
      wip_done_by_invitee(the_wip, user_id)


    end

    def award_for_product_to_stealth(product)
      karma_value = 1.0
      user_id = product.user_id

      chronicle_id = get_chronicle_id(user_id)
      Deed.create!({karma_value: karma_value, karma_event: product, user_id: user_id, chronicle_id: chronicle_id})
    end


  end
end
