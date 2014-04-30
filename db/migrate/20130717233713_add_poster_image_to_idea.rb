class AddPosterImageToIdea < ActiveRecord::Migration
  def change
    add_column :ideas, :poster, :string, :default => PosterImage::DEFAULT_PATH
  end
end
