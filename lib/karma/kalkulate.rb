module Karma
  class Kalkulate

    FOUNDER_BOUNTY_MULTIPLER = 0.05
    BOUNTY_KARMA_VALUE = 10.0
    BOUNTY_CREATOR_KARMA_SHARE = 0.3 #30%
    KARMA_FROM_INVITE = 3.0
    KARMA_FROM_COMPLETED_INVITE = 8.0
    TIP_RECIPIENT_KARMA = 3.0

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
      if product.name != "Assembly" and product.name != "Assembly Meta"
        kumulative_karma = 1.0  #starting karma
        product_bounties_n = product.tasks.won.count
        kumulative_karma = kumulative_karma + FOUNDER_BOUNTY_MULTIPLER * product_bounties_n
        return kumulative_karma
      else
        return 0.0
      end
    end

    def find_product_name_on_invite(invite)
      if invite.via_type == "Product"
        Product.find(invite.via_id).name
      elsif invite.via_type == "Wip"
        Product.find(Wip.find(invite.via_id).product_id).name
      end
    end

    def karma_from_invite(invite)
      productname = find_product_name_on_invite(invite)
      if productname !="Assembly" and productname != "Assembly Meta"
        chronicle_id = get_chronicle_id(invite.invitor_id)
        Deed.create!({karma_value: KARMA_FROM_INVITE, karma_event: invite, user_id: invite.invitor_id, chronicle_id: chronicle_id})
      end
    end

    def karma_from_bounty_creation_after_completion(the_wip)
      product_name = Product.find_by(id: the_wip.product_id).name
      if product_name != "Assembly" and product_name != "Assembly Meta"
        user_id = the_wip.user_id   #The author is always the user_id on the WIP
        chronicle_id = get_chronicle_id(user_id)
        Deed.create!({karma_value: BOUNTY_KARMA_VALUE*BOUNTY_CREATOR_KARMA_SHARE, karma_event: the_wip, user_id: user_id, chronicle_id: chronicle_id})
      end
    end


    def wip_done_by_invitee(the_wip, rewarded_user_id)
      product_name =  Product.find_by(id: the_wip.product_id).name
      if product_name != "Assembly" and product_name != "Assembly Meta"

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
      product_name = Product.find_by(id: the_wip.product_id).name
      if product_name != "Assembly" and product_name != "Assembly Meta"
        chronicle_id = get_chronicle_id(user_id)
        Deed.create!({karma_value: BOUNTY_KARMA_VALUE, karma_event: the_wip, user_id: user_id, chronicle_id: chronicle_id})

        #CHECK IF THIS WAS AN INVITE, reward invitor if YES
        wip_done_by_invitee(the_wip, user_id)
      end
    end

    def award_for_product_to_stealth(product)
      if product.name != "Assembly" and product.name != "Assembly Meta"
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

    def karma_rank(user_id)
      karma_users = Deed.uniq.pluck(:user_id)
      karma_totals = {}

      karma_users.each do |k|
        karma_totals[k]=[Deed.where(user_id: k).sum(:karma_value)]
      end
      karma_totals=Hash[karma_totals.sort_by{|k,v| v}.reverse]

      rank = karma_totals.keys.index(user_id)
      if rank.nil?
        rank = "Neophyte"
      end
      rank
    end

    def karma_from_tip(tip)
      productname = Product.find(tip.product_id).name
      if productname != "Assembly" and productname != "Assembly Meta"
        to_id = tip.to_id
        chronicle_id = get_chronicle_id(to_id)
        Deed.create!({karma_value: TIP_RECIPIENT_KARMA, karma_event: tip, user_id: to_id, chronicle_id: chronicle_id})
      end
    end

    def karma_from_heart(heart)
      if heart.heartable.product
        productname = heart.heartable.product.name
        user_id = heart.heartable.product.user.id

        if productname != "Assembly" and productname != "Assembly Meta"
          chronicle_id = get_chronicle_id(user_id_id)
          Deed.create!({karma_value: TIP_RECIPIENT_KARMA, karma_event: heart, user_id: user_id, chronicle_id: chronicle_id})
        end
      end
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
