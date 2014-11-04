class Domain < ActiveRecord::Base
  include Workflow

  validates :name, presence: true, uniqueness: true

  belongs_to :product
  belongs_to :user

  workflow_column :state
  workflow do
    state :external do
      event :transfer_initiated, transitions_to: :transferring
      event :transfer_failed, transitions_to: :transfer_fail
      event :purchase_application, transitions_to: :applied_for_purchase
    end
    state :transferring do
      event :transfer_completed,  transitions_to: :owned
    end
    state :applied_for_purchase do
      event :purchase_approved, transitions_to: :purchasing
    end
    state :transfer_fail do
      event :clear_error, transitions_to: :external
    end
    state :owned
  end

  def transfer_failed(error)
    update!(status: error)
    DomainMailer.delay(queue: :mailer).transfer_failed(self.id)
  end
end
