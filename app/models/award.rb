class Award < ActiveRecord::Base
  include Kaminari::ActiveRecordModelExtension

  belongs_to :awarder, class_name: 'User'
  belongs_to :winner, class_name: 'User'
  belongs_to :guest
  belongs_to :event
  belongs_to :wip

  after_commit :adjust_markings, on: :create
  before_validation :set_token, on: :create

  def claim!(user)
    update!(winner: user)
    TransactionLogEntry.minted!(nil, Time.current, wip.product, self.id, cents).tap do |minting|
      CoinsMinted.new.perform(minting.id)
    end
  end

  def url_params
    [wip.product, wip, self]
  end

  # private

  def adjust_markings
    return if winner.nil?

    AdjustMarkings.perform_async(winner.id, "User", self.wip.id, "Wip", 1.0)
  end

  def set_token
    return if guest.nil?

    self.token = Digest::MD5.hexdigest(SecureRandom.uuid)
  end
end
