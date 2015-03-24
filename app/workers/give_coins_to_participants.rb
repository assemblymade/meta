class GiveCoinsToParticipants
  include Sidekiq::Worker
  sidekiq_options queue: 'critical'

  def perform(chosen_participant_ids, product_id, coins_each=10)
    product = Product.find(product_id)
    author = product.user

    chosen_participant_ids.append(author.id).uniq
    chosen_participants = User.where(id: chosen_participant_ids)

    idea = Idea.find_by(product_id: product_id)

    if chosen_participants.count > 0 && idea
      title = "Participate in the Idea stage of #{product.name}"
      t = Task.create!({title: title, user: author, product: product, earnable_coins_cache: coins_each})

      if t.valid?
        NewsFeedItem.create_with_target(t)
        Offer.create!(user: author, bounty: t, earnable: coins_each, ip: author.current_sign_in_ip)
      end

      nfi = idea.news_feed_item

      chosen_participants.each do |p|

        events = nfi.comments.where(user_id: p.id) + nfi.hearts.where(user_id: p.id)
        if p.id == author.id
          event = nfi
        else
          event = events.first
        end

        if !event
          event = Event.create!({wip: t, user: p, type: "Event::ReviewReady"})
        end

        t.award!(author, event, coins_each) unless event.nil?
      end
    else
      TransactionLogEntry.minted!(nil, Time.now, product, author.id, coins_each)
    end
    t.delete!
    product.update_partners_count_cache
    product.save!
    product.partners_count
  end

end
