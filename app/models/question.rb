class Question
  GROUPS = {'basics'     => 'The Basics',
            'building'    => 'Building Apps',
            'revenue' => 'Revenue and App Coins',
            'privacy' => 'Privacy and Security',
             'community' => 'Community',
             'launching' => 'Launching a Project',
             'platform' => 'Using the Assembly Platform',
             'terms'       => 'Terminology'
        }

  cattr_writer :base_path
  def self.base_path
    @base_path || Rails.root.join('app/views/help/questions')
  end

  def self.from_file(file)
    YAML.load_stream(File.read(file)).each_slice(2).map do |meta, body|
      # :'s are read as hashes, convert back to string
      if body.is_a? Hash
        body = "#{body.keys.first}: #{body.values.first}"
      end

      new(meta.merge('body' => body))
    end

  rescue Errno::ENOENT
    raise ActiveRecord::RecordNotFound
  end

  def self.groups
    content_files.map{|f| File.basename(f, '.markdown') }
  end

  def self.by_group(name)
    from_file(file_name(name))
  end

  def self.cache_key(group)
    [group, File.mtime(file_name(group)).to_i]
  end

  def self.file_name(group)
    File.join(base_path, group.to_s + '.markdown')
  end

  def self.content_files
    Dir[File.join(base_path, '*.markdown')]
  end

  attr_reader :body
  attr_reader :group
  attr_reader :title

  def initialize(attributes)
    @title = attributes['title']
    @group = attributes['group']
    @body = attributes['body']
  end
end
