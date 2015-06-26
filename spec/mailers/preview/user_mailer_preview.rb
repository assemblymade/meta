class UserMailerPreview < ActionMailer::Preview

  def reset_password_instructions
    UserMailer.reset_password_instructions(User.where('reset_password_token is not null').random.first)
  end

  def bounty_holding_incoming
    tasks = Task.where('closed_at is null').limit(10)

    UserMailer.bounty_holding_incoming(User.sample.id, tasks.map(&:id))
  end

  def bounty_holding_incoming_take2
    tasks = Task.where('closed_at is null').limit(10)

    UserMailer.bounty_holding_incoming_take2(User.sample.id, tasks.map(&:id))
  end

  def featured_wips
    user = User.random.first

    UserMailer.featured_wips(user)
  end

  def twelve_hour_reminder
    user = User.find_by(username: 'pletcher')
    wip = Task.where(workers: [user], state: 'open').first

    UserMailer.twelve_hour_reminder(user.id, wip.id)
  end

  def follow_up
    UserMailer.follow_up(User.sample)
  end

  def remind_user_of_their_claimed_work
    worker = Wip::Worker.sample
    if worker.nil?
      worker = Time.travel(1.week.ago) do
        wip = Wip.sample
        wip.start_work!(User.sample)
      end
    end
    UserMailer.remind_user_of_their_claimed_work(worker.user.id, worker.wip.id)
  end

  def featured_work_apology
    product = Product.sample
    user = User.sample

    UserMailer.featured_work_apology(product, user)
  end

  def joined_team_no_introduction_yet
    membership = TeamMembership.where(bio: nil).sample
    UserMailer.joined_team_no_introduction_yet(membership.id)
  end
end
