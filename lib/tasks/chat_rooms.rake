namespace :chat_rooms do
  task migrate_rooms_to_landline: :environment do
    connection = ChatMigrator.new
    ChatRoom.where.not(slug: nil).find_each do |room|
      room.migrate_to(connection, '/teams/assembly/rooms')
    end
  end
end
