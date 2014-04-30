class Milestone < ActiveRecord::Base
  belongs_to :product
  belongs_to :user
  belongs_to :wip

  has_many :milestone_tasks
  has_many :milestone_images
  has_many :tasks, through: :milestone_tasks

  accepts_nested_attributes_for :tasks, :milestone_images

  after_commit :set_number_from_wip, on: :create

  scope :open, -> { joins(:wip).where('wips.closed_at is null') }
  scope :closed, -> { joins(:wip).where('wips.closed_at is not null') }
  scope :with_images, -> { where('milestone_images_count > 0') }
  scope :without_images, -> { where('milestone_images_count = 0') }

  def feature_image
    milestone_images.order(:created_at).last
  end

  def progress
    return 0 if milestone_tasks.count == 0

    tasks.closed.count / (milestone_tasks.count).to_f
  end

  def to_param
    number || id
  end

  # private

  def set_number_from_wip
    update_column :number, wip.number
  end
end
