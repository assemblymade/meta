class Users::ConfirmationsController < Devise::ConfirmationsController
  skip_before_action :validate_confirmed!
end