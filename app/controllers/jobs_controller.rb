class JobsController < ApplicationController

  before_action :authenticate_user!, :except => [:show, :index]
  before_action :set_product

  def index
    @product_jobs = ProductJob.where(:product_id => @product.id)
    @product_job = ProductJob.new
    @current_user = current_user

    @core_team = @product.core_team
    @watchers = @product.watchers
  end

  def show
  end

  def new
    @product_job = ProductJob.new
  end

  def create
    product = Product.friendly.find(params[:product_id])
    @product_job = ProductJob.where(:product_id => product.id, :category => params[:product_job][:category]).first

    if @product_job.blank?
      @product_job = ProductJob.new(jobs_params)
      @product_job.user_id = current_user.id
      @product_job.product_id = @product.id
      @product_job.save!
    end

    redirect_to product_jobs_path(@product)
  end

  def join
    @product = Product.friendly.find(params[:product_id])
    job = ProductJob.friendly.find(params[:job_id])
    role = ProductRole.where(:product_job_id => job.id, :user_id => current_user.id).first

    if role.blank?
      role = ProductRole.create(:product_job_id => job.id, :user_id => current_user.id, :product_id => @product.id)
    end

    if ProductRole.where(:product_id => @product.id, :user_id => current_user.id)
      Watching.watch!(current_user, @product)
      @product.votes.create(user: current_user, ip: request.remote_ip)
    end

    respond_to do |format|
      format.html { redirect_to product_jobs_path(@product) }
      format.js { render layout: false }
    end
  end

  def team_show
    @core_team = @product.core_team
    @team = @product.watchers
  end

  def part
    product = Product.friendly.find(params[:product_id])
    job = ProductJob.friendly.find(params[:job_id])
    role = ProductRole.where(:product_job_id => job.id, :user_id => current_user.id).first
    unless role.blank? or role.user_id != current_user.id
      role.destroy!
    end

    # comment product votes

    # check to make sure user doesn't have additional roles
    # if they dont, then unwatch and delete

    unless ProductRole.where(:product_id => product.id, :user_id => current_user.id)
      Watching.unwatch!(current_user, product)
      product.votes.where(user: current_user).first.destroy
    end

    redirect_to product_jobs_path()

  end

  private

  def jobs_params
    params.require(:product_job).permit(:category, :description, :slug)
  end

end
