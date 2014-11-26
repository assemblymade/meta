class SuggestionMailerPreview < ActionMailer::Preview

  def suggestion
    user = User.sample
    bounty_limit = 3
    SuggestionMailer.create(user.id, bounty_limit)
  end

end
