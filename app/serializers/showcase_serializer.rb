class ShowcaseSerializer < ApplicationSerializer
  attributes :slug, :name, :background

  def name
    I18n.t(object.slug.to_sym, scope: :showcases)
  end

end
