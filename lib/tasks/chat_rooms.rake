namespace :chat_rooms do
  task migrate_rooms_to_landline: :environment do
    class Migrator < OpenAssets::Remote
      def request(method, url, body)
        resp = connection.send(method) do |req|
          auth_hash = Base64.encode64("#{ENV['LANDLINE_SECRET']}:")
          req.url url
          req.headers['Authorization'] = "Basic #{auth_hash}"
          req.body = body
        end

        resp.body
      end
    end

    connection = Migrator.new(ENV['LANDLINE_URL'])
    ChatRoom.where.not(slug: nil).find_each do |room|
      room.migrate_to(connection, '/teams/assembly/rooms')
    end
  end
end
