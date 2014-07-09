class Admin::NewslettersController < AdminController

  def index
    @newsletters = Newsletter.order(:created_at).reverse_order
    @newsletter = Newsletter.new
  end

  def create
    @newsletter = Newsletter.new(newsletter_params)
    @newsletter.save

    # Send out dummy newsletter to staff
    @newsletter.send_email_to!(User.where(is_staff: true))

    respond_with @newsletter, location: admin_newsletters_path
  end

  def destroy
    @newsletter = Newsletter.find(params.fetch(:id))
    @newsletter.cancel!
    respond_with @newsletter, location: admin_newsletters_path
  end

  def publish
    @newsletter = Newsletter.find(params.fetch(:newsletter_id))
    @newsletter.publish!(User.mailable)
    respond_with @newsletter, location: admin_newsletters_path
  end

protected

  def newsletter_params
    params.require(:newsletter).permit(:subject, :body)
  end

end
