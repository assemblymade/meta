class AdminController < ApplicationController
  respond_to :html
  helper :admin

  before_action :authenticate_user!
  before_action :authenticate_staff!

  layout 'admin'

end
