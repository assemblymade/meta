module Karma
  class Kronikler

    def deed_date(deed)
      answer = nil
      if deed.karma_event_type == "Wip"
        awarded = Award.find_by(wip_id: deed.karma_event_id)
        if not awarded.nil?
          answer = awarded.created_at
        end
      elsif deed.karma_event_type == "Product"
        product = Product.find_by(id: deed.karma_event_id)
        if not product.nil?
          answer = product.created_at
        end
      elsif deed.karma_event_type == "Tip"
        tip = Tip.find_by(id: deed.karma_event_id)
        if not tip.nil?
          answer = tip.created_at
        end
      end
      if answer.nil?
        answer = DateTime.now
      end
      return answer
    end

    def deeds_by_user(user_id)
      deeds = Deed.where(user_id: user_id)
      deed_dates = []
      deeds.each do |d|
        deed_dates.append([d, deed_date(d)])
      end
      deed_dates
      deed_dates.sort{|a,b| a[1] <=> b[1]}
    end


    def product_text(deed)
      username = User.find_by(id: deed.user_id).username
      product_name = Product.find_by(id: deed.karma_event_id).name
      date = deed_date(deed)

      text = "#{product_name} was founded on #{date} by the visionary, #{username}.  "

    end

    def tip_text(deed)
      tip =  Tip.find_by(id: deed.karma_event_id)
      recipient = User.find_by(id: tip.to_id).username
      giver = User.find_by(id: tip.from_id).username
      amount = tip.cents
      product_name = Product.find_by(id: tip.product_id).name
      date = deed_date(deed)

      text = "#{recipient} was bestowed #{amount} precious #{product_name} coins on #{date} by the munificent #{giver}.  "

    end

    def invite_text(deed)

      invite = Invite.find_by(id: deed.karma_event_id)
      if not invite.nil?
        invitor = User.find_by(id: invite.invitor_id).username
        invitee = User.find_by(id: invite.invitee_id)
        if not invitee.nil?
          invitee=invitee.username
        else
          invitee=invite.invitee_email
        end
        date = deed_date(deed)
        invite_type = invite.via_type

        if deed.karma_value <5 #was just a request
          work_message = "#{invitor} invited #{invitee} "
          if invite_type == "Product"
            product_name = Product.find_by(id: invite.via_id).name
            work_message = work_message + "to work on the great #{product_name}, that they may forge great things together.  "
          elsif invite_type == "Wip"
            bounty_title = Task.find_by(id: invite.via_id).title
            work_message =  work_message + "to begin the great labor of #{bounty_title}, for which there was dire need.  "
          end
        elsif deed.karma_value >=5 #the work was actually done
          if invite_type == "Product"
            product_name = Product.find_by(id: invite.via_id).name
            work_message = "#{invitor} beckoned #{invitee} to join him on the great #{product_name}.  When #{invitee} answered the call, the people rejoiced.  "
          elsif invite_type == "Wip"
            bounty_title = Task.find_by(id: invite.via_id).title
            work_message = "#{invitee} labored over many moons for the fulfillment of #{bounty_title}, under the suggestion of wiser #{invitor}.  The results were glorious.  "
          end
        end
        return work_message

      end


    end

    def wip_text(deed)
      worker = User.find_by(id: deed.user_id).username
      bounty_title = Task.find_by(id: deed.karma_event_id).title

      date = deed_date(deed)
      message = "#{worker} masterfully wrought #{bounty_title} on #{date}.  The peoples' eyes glittered as they gazed upon it.  "

    end


    def convert_deed_to_text(deed)
      if deed.karma_event_type == "Product"
        product_text(deed)
      elsif deed.karma_event_type == "Tip"
        tip_text(deed)
      elsif deed.karma_event_type == "Invite"
        invite_text(deed)
      elsif deed.karma_event_type == "Wip"
        wip_text(deed)
      end
    end

  def make_kronikle(user_id)
    deeds = deeds_by_user(user_id)
    kronikle = ""
    deeds.each do |d|
      kronikle = kronikle + convert_deed_to_text(d[0])
    end
    return kronikle
  end

  end
end
