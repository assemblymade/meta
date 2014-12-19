class StorySentences
  attr_reader :story

  def initialize(story)
    @story = story
  end

  def verb
    story.verb.downcase
  end

  def subject
    if story.target.is_a? Product
      story.subject
    else
      story.target
    end
  end

  def target_type
    subject.class.name.underscore.downcase
  end

  def as_json
    owner = [
      t("verbs.#{verb}.singular"),
      '<b>' + t("subjects.short.#{target_type}.owner", subject.attributes.symbolize_keys) + '</b>'
    ]
    other = [
      t("verbs.#{verb}.singular"),
      '<b>' + t("subjects.short.#{target_type}.other", subject.attributes.symbolize_keys) + '</b>'
    ]

    if product = story.subject.try(:product)
      owner << "in #{product.name}"
      other << "in #{product.name}"
    end

    {
      owner: owner.join(' '),
      other: other.join(' ')
    }
  end

  # private

  def t(key, attributes={})
    I18n.t("stories.#{key}", attributes)
  end
end
