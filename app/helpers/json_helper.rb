module JsonHelper
  def json(serializer)
    hash = serializer.as_json
    if Rails.env.development?
      JSON.pretty_generate(hash).html_safe
    else
      hash.to_json.html_safe
    end
  end
end