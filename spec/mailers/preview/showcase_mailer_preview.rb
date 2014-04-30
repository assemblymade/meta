class ShowcaseMailerPreview < ActionMailer::Preview

  def product_soon_to_be_featured
    ShowcaseMailer.product_soon_to_be_featured(Showcase.sample.id)
  end

  def product_is_featured
    ShowcaseMailer.product_is_featured(Showcase.sample.id)
  end
  
end
