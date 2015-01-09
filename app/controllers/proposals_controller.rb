class ProposalsController < ProductController
  respond_to :html, :json

  before_action :set_product
  before_action :authenticate_user!

  def index

  end

  def create

  end


end
