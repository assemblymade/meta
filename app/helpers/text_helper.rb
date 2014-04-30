module TextHelper

  def pluralize_text(n, singular, plural)
    if n.to_i == 1
      singular
    else
      plural
    end
  end

end
