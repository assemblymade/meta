module YouTubeHelper

  def you_tube_embed(you_tube_video_url, options={})
    content_tag :iframe, nil, title: 'YouTube video player',
                              allowfullscreen: true,
                              frameborder: 0,
                              width: options[:width] || 585,
                              height: options[:height] || 440,
                              src: you_tube_video_url
  end

end
