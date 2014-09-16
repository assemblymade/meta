class TeamBuildingMailer < BaseMailer
  layout false

  def success(product_id)
    @product = Product.find(product_id)
    @application = PitchWeekApplication.where(product_id: @product.id).
      order('created_at DESC').
      first
    @user = @application.applicant

    mail to: @user.email_address,
      from: 'austin.smith@assembly.com',
      subject: "Yay! You did it. #{@product.name} was just greenlit."
  end

  def failure(product_id)
    @product = Product.find(product_id)
    @application = PitchWeekApplication.where(product_id: @product.id).
      order('created_at DESC').
      first
    @user = @application.applicant

    mail to: @user.email_address,
      from: 'austin.smith@assembly.com',
      subject: "Bummer. #{@product.name} didn't meet its team building goal."
  end
end
