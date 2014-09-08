module TextHelper

  def pluralize_text(n, singular, plural)
    if n.to_i == 1
      singular
    else
      plural
    end
  end

  def inline_sentence(i, count)
    if i == count - 2
      ' and '
    elsif i < count - 2
      ', '
    end
  end

end
