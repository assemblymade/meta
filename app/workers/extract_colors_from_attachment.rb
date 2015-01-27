class ExtractColorsFromAttachment
  include Sidekiq::Worker

  def perform(attachment_id)
    attachment = Attachment.find(attachment_id)

    # Miro.options[:method] = 'histogram'
    colors = Miro::DominantColors.new(attachment.url)

    attachment.update!(dominant_colors: colors.to_hex.uniq)
  end
end
