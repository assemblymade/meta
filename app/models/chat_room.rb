class ChatRoom < ActiveRecord::Base
  belongs_to :product # could be null for a global chat room
  belongs_to :wip

  validates :slug, presence: true
  validates :wip, presence: true

  default_scope -> { where(deleted_at: nil) }

  def self.general
    find_by(slug: 'general')
  end

  def follower_ids
    if product
      product.follower_ids
    else
      []
    end
  end

  def migrate_to(connection, url)
    data = {
      slug: slug,
      topic: product.try(:pitch) || slug
    }
    connection.post(url, data)
  end

  def key
    "chat_#{id}"
  end

  def name
    if general?
      'Community Chat'
    else
      [product_name, 'Chat'].join(' ')
    end
  end

  def full_slug
    context = ''
    if product
      context = "#{product.name} "
    end
    "#{context}##{slug}"
  end

  def product_name
    product && product.name
  end

  def general?
    slug == 'general'
  end

  def to_param
    slug
  end

  def url_params
    [self]
  end

  def self.create_for_product(product, current_user)
    main_thread = product.discussions.create!(title: Discussion::MAIN_TITLE, user: current_user, number: 0)
    product.update(main_thread: main_thread)
    product.chat_rooms.create!(wip: main_thread, slug: product.slug)
  end

end
