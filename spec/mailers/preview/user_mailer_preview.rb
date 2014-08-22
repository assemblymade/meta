class UserMailerPreview < ActionMailer::Preview

  def welcome
    UserMailer.welcome(User.sample.id)
  end

  def reset_password_instructions
    UserMailer.reset_password_instructions(User.where('reset_password_token is not null').random.first)
  end


  def featured_wips
    user = User.random.first

    UserMailer.featured_wips(user.id)
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

  def joined_team_no_work_yet
    membership = TeamMembership.sample
    UserMailer.joined_team_no_work_yet(membership.id)
  end

  def joined_team_no_introduction_yet
    membership = TeamMembership.where(bio: nil).sample
    UserMailer.joined_team_no_introduction_yet(membership.id)
  end
end
