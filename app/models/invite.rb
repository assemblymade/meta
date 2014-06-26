class Invite < ActiveRecord::Base
  belongs_to :invitor, class_name: 'User'
  belongs_to :invitee, class_name: 'User'
  belongs_to :via, polymorphic: true

  validate :invitee_or_email
  validates :via, presence: true

  before_validation :set_invitee

  attr_accessor :username_or_email
  attr_accessor :username

  delegate :product, to: :via

  def self.create_and_send(attributes={})
    transaction do
      create(attributes).tap do |invite|
        if invite.valid?
          TransactionLogEntry.transfer!(
            invite.product,
            from = invite.invitor.id,
              to = invite.id,
            invite.tip_cents,
            via=invite.id,
            invite.created_at
          )

          invite.update_attributes sent_at: Time.now
          InviteMailer.delay.invited(invite.id)
        end
      end
    end
  end

  def claim!(claimant)
    with_lock do
      TransactionLogEntry.transfer!(
        product,
        from = id,
          to = claimant.id,
        tip_cents,
        via=id
      )
      self.claimed_at = Time.now
      self.invitee = claimant
      save!
    end
  end

  # private

  def invitee_or_email
    if invitee.nil? && invitee_email.blank?
      errors.add(:username_or_email, 'not a valid username or email')
    end

    if invitee_email_changed?
      if Invite.find_by(invitor: invitor, invitee_email: invitee_email).present?
        errors.add(:username_or_email, 'already invited')
      end
    end

    if invitee_id_changed?
      if Invite.find_by(invitor: invitor, invitee_id: invitee_id).present?
        errors.add(:username_or_email, 'already invited')
      end
    end
  end

  def set_invitee
    return if username_or_email.nil?

    if username_or_email =~ User::USERNAME_REGEX
      self.invitee = User.find_by(username: $1.strip)
    else
      self.invitee_email = username_or_email.strip
    end
  end
end