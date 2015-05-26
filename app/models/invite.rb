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
          InviteMailer.delay(queue: 'mailer').invited(invite.id)
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

      if core_team?
        product.core_team_memberships.find_or_create_by(user: claimant)
      end

      save!
    end
  end

  def core_team=(invite_to_core_team = true)
    self.extra ||= {}
    self.extra['core_team'] = invite_to_core_team
  end

  def core_team?
    (self.extra || {})['core_team']
  end

  # private

  def invitee_or_email
    if invitee.nil? && invitee_email.blank?
      errors.add(:username_or_email, 'not a valid username or email')
    end

    if username_or_email.present?
      existing_invite = if self.invitee_email.present?
        Invite.find_by(invitor: invitor, invitee_email: invitee_email)
      elsif self.invitee_id.present?
        Invite.find_by(invitor: invitor, invitee_email: invitee_email).present?
      end

      errors.add(:username_or_email, 'already invited') if existing_invite.present?
    end
  end

  def set_invitee
    return if username_or_email.nil?


    if username_or_email =~ User::USERNAME_REGEX
      self.invitee = User.find_by(username: $1.strip)
    else
      self.invitee_email = username_or_email.strip
    end
    self.username_or_email = nil
  end
end
