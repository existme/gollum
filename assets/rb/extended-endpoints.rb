def dump(obj)
  # puts YAML::dump(obj.inspect)
  # ap Oj.dump( obj, :mode => :object )

  # ap obj.local_variables
  # puts [obj.to_s.red,obj.inspect].join(" : ".blue)
  # puts "\n.........................\n"
  obj.instance_variables.map do |var|
    p [var.to_s, obj.instance_variable_get(var)].join(' : ')
    p obj.instance_variable_get(var).to_yaml[0..200]
  end
  # p obj.to_yaml
  # data = [ false, 42, %w(forty two), { :now => Time.now, :class => Time.now.class, :distance => 42e42 } ]
  # ap data
end

def remove_extension(file)
  file.chomp(File.extname(file))
end

def rename_string(from, to, current)
  fromWE = remove_extension(from)
  toWE = remove_extension(to)
  current.gsub(fromWE, toWE)
end

module Precious
  class App
    get '/' do
      redirect 'http://google.com'
    end
    before /^(\/rcc\/)/ do
      # redirect "http://google.com"
      # dump(request)
      # p request.path_info
      # p request.path
      # p request["path"]
      # p request["item"]
      # p request.query_string
      wiki = wiki_new
      repo = wiki.path
      case request.path_info
      when '/rcc/quicksave'
        forbid unless @allow_editing

        path = '/' + clean_url(sanitize_empty_params(params[:path])).to_s
        page_name = CGI.unescape(params[:page])
        wiki = wiki_new
        page = wiki.paged(page_name, path, exact = true)
        return if page.nil?
        committer = Gollum::Committer.new(wiki, commit_message)
        commit = { committer: committer }

        update_wiki_page(wiki, page, params[:content], commit, page.name, params[:format])
        update_wiki_page(wiki, page.header, params[:header], commit) if params[:header]
        update_wiki_page(wiki, page.footer, params[:footer], commit) if params[:footer]
        update_wiki_page(wiki, page.sidebar, params[:sidebar], commit) if params[:sidebar]
        committer.commit
        halt 200, { 'Content-Type' => 'text/plain' }, 'page saved'
      when '/rcc/delete'
        folder = URI.decode(request['folder'])
        current = request['current']
        value = `assets/bin/cmd-delete-folder.sh "#{folder}" "#{repo}"`

        if !current.start_with?('/' + folder)
          redirect to(current)
        else
          redirect to('/')
        end
        halt 200, { 'Content-Type' => 'text/plain' }, "folder deleted [#{value}]"
      when '/rcc/delete-file'
        file = URI.decode(request['file'])
        current = request['current']
        value = `assets/bin/cmd-delete-file.sh "#{file}" "#{repo}"`
        p value
        if file != current + '.md'
          redirect to(current)
        else
          redirect to('/')
        end
        halt 200, { 'Content-Type' => 'text/plain' }, "folder deleted [#{value}]"
      when '/rcc/rename-folder'
        from = request['from']
        to = request['to']
        current = request['current']
        value = `assets/bin/cmd-rename-folder.sh "#{from}" "#{to}" "#{repo}"`
        puts value
        redirect to(URI.encode(rename_string(from, to, current)))
        halt 200, { 'Content-Type' => 'text/plain' }, "renamed\n #{value}"
      when '/rcc/rename-file'
        from = request['from']

        to = request['to']
        current = request['current']


        value = `assets/bin/cmd-rename-file.sh "#{from}" "#{to}" "#{repo}"`
        puts value
        redirect to(URI.encode(rename_string(from, to, current)))
        # halt 200, {'Content-Type' => 'text/plain'}, "renamed\n #{current.gsub(from, to)}"
        halt 200, { 'Content-Type' => 'text/plain' }, "renamed\n #{value}"
      when '/rcc/query-page'
        url = request['url']

        res = ''
        open(url) do |f|
          doc = Nokogiri::HTML(f)
          res = doc.at_css('title').text
        end
        abb = res.gsub(/\b(\w)|./, '\1').upcase()
        # halt 200, {'Content-Type' => 'text/plain'}, "renamed\n #{current.gsub(from, to)}"
        halt 200, { 'Content-Type' => 'json' }, { title: res, abbrev: abb }.to_json
      when '/rcc/upload-file'
        forbid unless @allow_editing

        unless wiki.allow_uploads
          @message = 'File uploads are disabled'
          mustache :error
          return
        end

        if params[:data]
          fullname = params[:data][:filename]
          tempfile = params[:data][:tempfile]
        end
        halt 500 unless tempfile.is_a? Tempfile
        p params

        dir = wiki.per_page_uploads ? params[:upload_dest] : ::File.join([wiki.page_file_dir, 'uploads'].compact)
        ext = ::File.extname(fullname)
        format = ext.split('.').last || 'txt'
        filename = ::File.basename(fullname, ext)
        reponame = filename + '.' + format
        reponame = reponame.gsub(' ', '_')

        author = session['gollum.author']
        author = author.nil? ? 'anonymous' : author[:name]

        value = `assets/bin/cmd-create-folder.sh "#{dir}" "#{repo}"`

        newfile = dir + '/' + reponame
        File.open(wiki.path + '/' + newfile, 'wb') do |f|
          f.write(tempfile.read)
        end
        p "assets/bin/cmd-commit-file.sh \"#{newfile}\" \"#{author}\" "
        value = `assets/bin/cmd-commit-file.sh "#{newfile}" "#{author}" "#{repo}"`
        p 'file commited! ' + value
        halt 200, { 'Content-Type' => 'text/plain' }, "uploaded\n #{params[:file]}"
      end
      halt 404, { 'Content-Type' => 'text/plain' }, request.path + ' not found'
    end
  end
end
