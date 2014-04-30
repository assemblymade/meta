module IdeasHelper
  def current_user_voted?
    current_user.try(:has_voted_for?, @product)
  end
end