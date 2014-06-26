class InviteSerializer < ApplicationSerializer
  attributes :invitee_email

  has_one :invitee
end