module MailUrlHelper
  # url_for in email views doesn't do the full path, hence this insanity:
  def full_url_for(entity)
    params = entity.url_params
    if params.last.is_a?(Hash)
      url_for([*params[0..-2], params.last.merge(only_path: false)])
    else
      url_for([params, only_path: false])
    end
  end
end
