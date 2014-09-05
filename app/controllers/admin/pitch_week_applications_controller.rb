class Admin::PitchWeekApplicationsController < AdminController
  def index
    @applications = PitchWeekApplication.includes(:product).
      to_review.order(created_at: :desc).page(params[:page])
  end

  def approve
    @application = PitchWeekApplication.find(params[:pitch_week_application_id])
    @application.review(current_user, true)
    redirect_to admin_pitch_week_applications_path
  end

  def decline
    @application = PitchWeekApplication.find(params[:pitch_week_application_id])
    @application.review(current_user, false)
    redirect_to admin_pitch_week_applications_path
  end
end
