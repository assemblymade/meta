require 'activerecord/uuid'

class Wip::Worker < ActiveRecord::Base
  include ActiveRecord::UUID
  MIA_DURATION = 36.hours

  @table_name = 'wip_workers'

  belongs_to :user
  belongs_to :wip

  validates :user, presence: true
  validates :wip, presence: true

  scope :mia,  -> { open_wips.where(mia_where_clause, MIA_DURATION.ago, MIA_DURATION.ago, MIA_DURATION.ago, MIA_DURATION.ago) }
  scope :dead, -> { open_wips.where(dead_clause, MIA_DURATION.ago, MIA_DURATION.ago) }
  scope :open_wips, -> { joins(:wip).where("state = ? ", Task::IN_PROGRESS) }

  def remind!
    transaction do
      increment(:checkin_count)
      touch(:last_checkin_at)
      UserMailer.delay(queue: 'mailer').remind_user_of_their_claimed_work(user.id, wip.id)
    end
  end

  def checked_in!
    touch(:last_response_at)
  end

  def abandon!
    message = "Reopening this up because #{user.username} took longer then #{MIA_DURATION} to resume work."
    wip.unallocate!(User.asm_bot, message)
  end

  private
  def self.dead_clause
    '(last_response_at < ? AND last_checkin_at < ?)'
  end

  def self.mia_where_clause
    clause =  ['(wip_workers.created_at < ? AND last_checkin_at IS NULL)']
    clause << '(last_checkin_at < ? AND last_response_at IS NULL)'
    clause << dead_clause
    clause.join(' OR ')
  end
end
