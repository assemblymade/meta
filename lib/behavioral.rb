require 'active_support/time'

class Behavioral
  # send_if should return true or an array of values to pass to the mailer
  def self.emails
    [
      {
        id: '9e319b95-fab3-4237-9f60-5173c33cc82f',
        view: 'idle_1',
        send_if: ->(user) {
          user.created_at <= 1.day.ago and idle_cohort(user)
        },
      }, {
        id: '4d8fc9e3-5756-471b-b1dc-5fd7c3016e1f',
        view: 'idle_2',
        send_if: ->(user) {
          user.created_at <= 4.days.ago and idle_cohort(user)
        },
      }, {
        id: '4d8fc9e3-5756-471b-b1dc-5fd7c3016e1f',
        view: 'idle_3',
        send_if: ->(user) {
          user.created_at <= 7.days.ago and idle_cohort(user)
        },
      }, {
        id: 'd8ad0272-ecbc-497c-a66e-b3ec6e405b39',
        view: 'created_idea_missing_fields',
        send_if: ->(user) {
          user.products.select do |product|
            product.created_at <= 3.hours.ago and product_missing_fields(product).any?
          end
        },
      }, {
        id: '8c7773c1-6083-42b6-b57e-dd9c1db73282',
        view: 'submitted_idea_low_page_views',
        send_if: ->(user) {
          user.products.approved.select do |product|
            product.submitted_at <= 1.day.ago and
            product_low_page_views(product)
          end
        },
      }, {
        id: '8c7773c1-6083-42b6-b57e-dd9c1db73282',
        view: 'backed_idea_is_number_one',
        send_if: ->(user) {
          leaderboard = ::IdeaLeaderboard.new(Leaderboard.new($redis))
          if product = leaderboard.idea_at(0)
            product.voted_by?(user) ? [product] : nil
          end
        },
      }
    ]
  end

  def self.idle_cohort(user)
    user.votes.size == 0 and user.products.size == 0
  end

  def self.product_missing_fields(product)
    [:pitch, :description, :suggested_perks].select do |field|
      product.send(field).nil?
    end
  end

  def self.product_low_page_views(product)
    product.view_count < 100
  end

  def emails_matching(users)
    mails = []
    Array(users).each do |user|
      Behavioral.emails.each do |email|
        if !sent?(user, email[:id])
          if values = Behavioral.truthy(email[:send_if].call(user))
            mail = {
              user_id: user.id,
              view: email[:view],
            }
            mail[:values] = values if values.any?
            mails << mail

            log_email(user, email[:id])
          end
        end
      end
    end
    mails
  end

  def log_email(user, email_id)
    log = EmailLog.new
    log.user_id = user.id
    log.email_id = email_id
    log.save!
  end

  def sent?(user, email_id)
    EmailLog.where(
      user_id: user.id,
      email_id: email_id,
    ).count > 0
  end

  def self.truthy(values)
    return false if values.nil? || values == false
    return [] if values == true
    if values.respond_to? :all?
      return false if values.empty?
    end
    values
  end
end