class Muting < ActiveRecord::Base
  belongs_to :wip
  belongs_to :user

  validates :wip, uniqueness: { scope: :user }

  def self.mute!(user, wip)
    if existing_muting = Muting.find_or_initialize_by(user: user, wip: wip)
      existing_muting.update! deleted_at: nil
    else
      Muting.create!(user: user, wip: self)
    end
  end

  def self.unmute!(user, wip)
    if existing_muting = Muting.find_or_initialize_by(user: user, wip: wip)
      existing_muting.update! deleted_at: Time.now
    end
  end
end
