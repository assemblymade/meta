module Karma
  class Kronikler

    def deed_date(deed)
      deed.karma_event.created_at
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

    def product_of_deed(deed)
      if deed.karma_event_type == "Product"
        deed.karma_event.name
      elsif deed.karma_event
        deed.karma_event.product.name
      end
    end

    def karma_product_associations_by_user(user_id)
      deeds = deeds_by_user(user_id)
      history = []
      deeds.map{|row| row[0]}.each do |d|
        tempentry= [d.parent_product, d.karma_value, deed_date(d)]
        history.append(tempentry)
      end
      return history
    end

    def karma_product_history_by_user(user_id)
      product_history = karma_product_associations_by_user(user_id)
      product_names = product_history.map{|row| row[0]}.uniq

      history = [[0]*(product_names.count+1)]

      product_history.each do |p|
        productname = p[0]
        prod_position = product_names.index(productname)+1
        tempentry = history.last.dup
        tempentry[0] = p[2]
        tempentry[prod_position] = tempentry[prod_position] + p[1]
        history.append(tempentry)
      end
      newhistory = []
      #make into fractions
      n=0
      history.each do |p|
        sum = p[1, p.count].sum
        if sum == 0
          sum=1
        end
        r = []
        n=n+1
        r.append(p[0])
        p[1, p.count].each do |a|
          a = a.to_f / sum.to_f*100.0
          r.append(a)
        end
        newhistory.append(r)
      end
      return newhistory[1, newhistory.count], product_names
    end

    def aggregate_karma_info_per_user(user_id)
      deeds = Deed.where(user_id: user_id)

      aggregate = {}
      aggregate['Bounties'] = deeds.where(karma_event_type: "Wip").sum(:karma_value)
      aggregate['Tips'] = deeds.where(karma_event_type: "Tip").sum(:karma_value)
      aggregate['Invites'] = deeds.where(karma_event_type: "Invite").sum(:karma_value)
      aggregate['Products'] = deeds.where(karma_event_type: "Product").sum(:karma_value)

      return aggregate
    end

    def karma_rankings()

    end


    def product_text(deed)
      username = User.find_by(id: deed.user_id).username
      product_name = Product.find_by(id: deed.karma_event_id).name
      date = Date.parse(deed_date(deed).to_s).strftime("%m-%d-%Y")
      text = "#{product_name} was founded on #{date} by the visionary, #{username}."
    end

    def tip_text(deed)
      tip =  Tip.find_by(id: deed.karma_event_id)
      recipient = User.find_by(id: tip.to_id).username
      giver = User.find_by(id: tip.from_id).username
      amount = tip.cents
      product_name = Product.find_by(id: tip.product_id).name
      date = Date.parse(deed_date(deed).to_s).strftime("%m-%d-%Y")
      text = "#{recipient} was tipped #{amount} #{product_name} coins on #{date} by #{giver}."
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
        date = Date.parse(deed_date(deed).to_s).strftime("%m-%d-%Y")
        invite_type = invite.via_type

        if deed.karma_value <5 #was just a request
          work_message = "#{invitor} invited #{invitee} "
          if invite_type == "Product"
            product_name = Product.find_by(id: invite.via_id).name
            work_message = work_message + "to work on #{product_name}."
          elsif invite_type == "Wip"
            bounty_title = Task.find_by(id: invite.via_id).title
            work_message =  work_message + "to work on #{bounty_title}."
          end
        elsif deed.karma_value >=5 #the work was actually done
          if invite_type == "Product"
            product_name = Product.find_by(id: invite.via_id).name
            work_message = "#{invitor} asked #{invitee} to join him on #{product_name}.  #{invitee} answered the call!"
          elsif invite_type == "Wip"
            bounty_title = Task.find_by(id: invite.via_id).title
            work_message = "#{invitee} worked on #{bounty_title}, after the suggestion of #{invitor}."
          end
        end
        return work_message
      end
    end

    def wip_text(deed)
      worker = User.find_by(id: deed.user_id).username
      task = Task.find_by(id: deed.karma_event_id)
      bounty_title = task.title
      productname = Product.find_by(id: task.product_id).name

      date = Date.parse(deed_date(deed).to_s).strftime("%m-%d-%Y")
      message = "#{worker} completed #{bounty_title} on #{date} for #{productname}."
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

    def meta_karma_history(bin_average)
      history = {}  # [[date1, newkarma1], [date2, newkarma2]]
      Deed.all.each do |d|
        date = deed_date(d)
        if history.include?(date)
          history[date] = history[date] + d.karma_value
        else
          history[date] = d.karma_value
        end
      end

      range = (history.keys[0]..history.keys.last)
      range.each do |r|
        if not history.include?(r)
          history[r] = 0
        end
      end


      history = history.sort.to_h

      #bin into smoother averages
      n=0
      temp = 0
      smooth_history = []
      history.each do |h|

        temp =  temp + h[1]
        if n%bin_average == 0
          smooth_history.append([ h[0], temp.to_f / bin_average.to_f])
          temp = 0
        end
        n=n+1
      end
      smooth_history

    end


  end
end
