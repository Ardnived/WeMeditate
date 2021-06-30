namespace :migrate do
  desc "Migrate content json to the new format"
  task :content, [:model, :id] => :environment do |_, args|
    if args.model && args.id
      record = args.model.classify.constantize.find(args.id)
      record.migrate_content!
    else
      [Article, StaticPage, Stream, SubtleSystemNode, Treatment].each do |model|
        model.in_batches do |record|
          record.migrate_content!
        end
      end
    end
  end
end