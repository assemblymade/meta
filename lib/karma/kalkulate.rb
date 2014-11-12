module Karma
  class Kalkulate

    FOUNDER_BOUNTY_MULTIPLER = 0.05
    BOUNTY_KARMA_VALUE = 10.0
    BOUNTY_CREATOR_KARMA_SHARE = 0.3 #30%
    KARMA_FROM_INVITE = 2.0
    KARMA_FROM_COMPLETED_INVITE = 8.0
    TIP_RECIPIENT_KARMA = 1.0

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
      if product.name != "Assembly"
        kumulative_karma = 1.0  #starting karma
        product_bounties_n = product.tasks.won.count
        kumulative_karma = kumulative_karma + FOUNDER_BOUNTY_MULTIPLER * product_bounties_n
        return kumulative_karma
      else
        return 0.0
      end
    end

    def karma_from_invite(invite)
      recipient_id = invite.invitor_id
      chronicle_id = get_chronicle_id(recipient_id)
      Deed.create!({karma_value: KARMA_FROM_INVITE, karma_event: invite, user_id: recipient_id, chronicle_id: chronicle_id})
    end

    def karma_from_bounty_creation_after_completion(the_wip)
      if Product.find_by(id: the_wip.product_id).name != "Assembly"
        user_id = the_wip.user_id   #The author is always the user_id on the WIP
        chronicle_id = get_chronicle_id(user_id)
        Deed.create!({karma_value: BOUNTY_KARMA_VALUE*BOUNTY_CREATOR_KARMA_SHARE, karma_event: the_wip, user_id: user_id, chronicle_id: chronicle_id})
      end
    end


    def wip_done_by_invitee(the_wip, rewarded_user_id)
      if Product.find_by(id: the_wip.product_id).name != "Assembly"

        relevant_invite = Invite.where(via_id: the_wip.id).where(invitee_id: rewarded_user_id)

        if relevant_invite.count > 0 #not empty
          #there should only ever be one invite per user/product pair
          relevant_invite = relevant_invite.first
          invitor_id = relevant_invite.invitor_id
          chronicle_id = get_chronicle_id(invitor_id)
          Deed.create!({karma_value: KARMA_FROM_COMPLETED_INVITE, karma_event: relevant_invite, user_id: invitor_id, chronicle_id: chronicle_id})
        end
      end
    end


    def karma_from_bounty_completion(the_wip, user_id)
      if Product.find_by(id: the_wip.product_id).name != "Assembly"
        chronicle_id = get_chronicle_id(user_id)
        Deed.create!({karma_value: BOUNTY_KARMA_VALUE, karma_event: the_wip, user_id: user_id, chronicle_id: chronicle_id})

        #CHECK IF THIS WAS AN INVITE, reward invitor if YES
        wip_done_by_invitee(the_wip, user_id)
      end
    end

    def award_for_product_to_stealth(product)
      if product.name != "Assembly"
        karma_value = 1.0
        user_id = product.user_id

        chronicle_id = get_chronicle_id(user_id)
        Deed.create!({karma_value: karma_value, karma_event: product, user_id: user_id, chronicle_id: chronicle_id})
      end
    end

    def top_users(top_n)
      karma_users = Deed.uniq.pluck(:user_id)
      karma_totals = []

      karma_users.each do |k|
        karma_totals.append( [k, Deed.where(user_id: k).sum(:karma_value)] )
      end

      @karma_results = karma_totals.sort{|a,b| b[1] <=> a[1]}[0, top_n]
    end

    def karma_from_tip(tip)
      to_id = tip.to_id
      chronicle_id = get_chronicle_id(to_id)
      Deed.create!({karma_value: TIP_RECIPIENT_KARMA, karma_event: tip, user_id: to_id, chronicle_id: chronicle_id})
    end


    #ONE TIME RETROACTIVE INITIALIZATIONS
    def retroactively_add_bounty_karma()
      n=0
      Task.all.each do |w|
        w.winners.each do |t|
          n=n+1
          puts n
          karma_from_bounty_completion(w, t)
          karma_from_bounty_creation_after_completion(w)
        end
      end
    end

    def retroactively_add_tip_karma()
      Tip.all.each do |t|
        karma_from_tip(t)
      end
    end

    def retroactively_add_product_karma()
      Product.all.each do |p|
        award_for_product_to_stealth(p)
      end
    end

    def retroactively_add_invite_karma()
      Invite.all.each do |i|
        karma_from_invite(i)
      end
    end

    def retroactively_build_all()
      retroactively_add_bounty_karma()
      retroactively_add_tip_karma()
      retroactively_add_product_karma()
      retroactively_add_invite_karma()
    end

  end
end
