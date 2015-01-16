require 'activerecord/uuid'

class OwnershipStatus < ActiveRecord::Base
  include ActiveRecord::UUID
  include Workflow

  belongs_to :product

  workflow_column :state

  workflow do
    state :unowned do
      event :request,
        transitions_to: :requested

      event :set_pending_30,
        transitions_to: :pending

      event :set_pending_60,
        transitions_to: :pending

      event :set_not_applicable,
        transitions_to: :not_applicable
    end

    state :not_applicable do
      event :unown,
        transitions_to: :unowned
    end

    state :pending do
      event :own,
        transitions_to: :owned
      event :request,
        transitions_to: :requested
      event :undo,
        transitions_to: :unowned
    end

    state :requested do
      event :own,
        transitions_to: :owned
      event :undo,
        transitions_to: :unowned
    end

    state :owned do
      event :undo,
        transitions_to: :requested
      event :unown,
        transitions_to: :unowned
    end

    after_transition do |from, to, triggering_event, *event_args|
      update!(state_updated_at: Time.now)
    end
  end

  def set_pending_30
    update!(pending_until: Time.now + 30.days)
  end

  def set_pending_60
    update!(pending_until: Time.now + 60.days)
  end

  def on_owned_entry(new_state, event, *args)
    update!(owned_at: Time.now)
  end

  def on_owned_exit(new_state, event, *args)
    update!(owned_at: nil)
  end

  def on_pending_exit(new_state, event, *args)
    update!(pending_until: nil)
  end

end
