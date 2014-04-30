class ProductMissionDecorator < ApplicationDecorator

  decorates_finders

  def progress_percentage
    h.number_to_percentage(progress / steps.to_f * 100, precision: 0)
  end

  # TODO: (whatupdave) this is a hack, can't have hints as an array because I18n won't interpolate
  # (http://stackoverflow.com/questions/21574900/interpolation-in-i18n-array)
  def hints
    [
      translate(:hint_1),
      translate(:hint_2),
      translate(:hint_3),
    ]
  end

  def translate(key, options={})
    I18n.t "missions.#{id}.#{key}", {
      product: product.name,
      product_path: h.product_path(product)
    }.merge(options)
  end

  def just_completed?
    !previous_name.nil?
  end

  def previous_name
    h.flash[:mission_completed]
  end

  def mission_analytics
    ProductAnalyticsSerializer.new(product, scope: h.current_user)
  end
end
