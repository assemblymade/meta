class CoreTeamMailerPreview < ActionMailer::Preview
  def welcome
    # Mock up some data for the preview
    product = Product.find_by_slug('helpful')
    user = product.core_team.first

    # Return a Mail::Message here (but don't deliver it!)
    CoreTeamMailer.welcome(product.id, user.id)
  end

  def featured_work
    product = Product.sample

    CoreTeamMailer.featured_work(product.id)
  end
end
