class Admin::ProfitReportsController < AdminController
  def index
    @reports = ProfitReport.all.order(end_at: :desc)
  end

  def show
    @report = ProfitReport.find(params[:id])
  end
end