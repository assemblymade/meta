class PlaygroundController < ApplicationController
  layout 'product'

  before_action :authorize_staff!

  def authorize_staff!
    authorize! :read, :playground
  end

end
