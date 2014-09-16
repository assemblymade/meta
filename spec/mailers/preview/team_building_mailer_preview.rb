class TeamBuildingMailerPreview < ActionMailer::Preview
  def success
    product = PitchWeekApplication.first.product
    TeamBuildingMailer.success(product.id)
  end

  def failure
    product = PitchWeekApplication.first.product
    TeamBuildingMailer.failure(product.id)
  end
end
