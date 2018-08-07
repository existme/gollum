module Gollum
  class Macro
    class TraverseMacro < Gollum::Macro
      def dump(obj)
        # puts YAML::dump(obj.inspect)
        # ap Oj.dump( obj, :mode => :object )

        # ap obj.local_variables
        # puts [obj.to_s.red,obj.inspect].join(" : ".blue)
        # puts "\n.........................\n"
        obj.instance_variables.map do |var|
          puts [var.to_s.red, obj.instance_variable_get(var)].join(" : ".blue)
          puts obj.instance_variable_get(var).to_yaml[0..200].green
        end
        # puts obj.to_yaml
        # data = [ false, 42, %w(forty two), { :now => Time.now, :class => Time.now.class, :distance => 42e42 } ]
        # ap data
      end

      def render(title = "Global Table of Contents")
        # dump(@wiki)
        render_file
      end

      def new_folder(folder_path)
        new_sub_folder folder_path
      end

      def new_sub_folder(path,folder)
        %Q(<li class="folder" data-href="#{folder}">#{path}<ul>)
      end

      def enclose_tree(string)
        %Q(<div id="tree"><ul id="treeData" style="display:none" class="tree">\n) + string + %Q(</ul></div>)
      end

      def new_page(page)
        name = ::File.basename(page.path)
        url, valid_page  = url_for_page page
        path = page.path
        if path.end_with?(".md")
          %Q(<li data-href="#{url}" id="#{path}" data-icon="md">#{name}</li>)
        elsif path =~ /^.*(\.png|\.jpg|\.gif)$/
          %Q(<li data-href="#{url}" id="#{path}" data-icon="png">#{name}</li>)
        else
          %Q()
        end
        # %Q(  <li class="file"><a href="#{url}">xxx#{name}</a>#{valid_page ? "" : delete_file(url, valid_page)}</li>)
      end

      def end_folder(path)
        "</ul></li>"
      end

      def url_for_page(page)
        url = ''
        valid_page_name = false
        # Remove ext for valid pages.
        filename = page.filename
        valid_page_name =  Page::valid_page_name?(filename)
        filename = valid_page_name ? filename.chomp(::File.extname(filename)) : filename

        url = ::File.join(::File.dirname(page.path), filename)
        url = url[2..-1] if url[0, 2] == './'
        return url, valid_page_name
      end

      def render_file
        @pages       = @wiki.pages + @wiki.files
        html         = ''
        count        = @pages.size
        folder_start = -1

        # Process all pages until folders start
        count.times do |index|
          page = @pages[index]
          path = page.path

          unless path.include? '/'
            # Page processed (not contained in a folder)
            html += "<p>"+path + "</p><br>"
          else
            # Folders start at the next index
            # html += "<p>"+index.inspect+"</p><br>"
            folder_start = index
            break # Pages finished, move on to folders
          end
        end
        ignoredList = Regexp.new('.*(assets)\/.*').freeze
        sorted_folders = []
        (folder_start).upto count - 1 do |index|
          path = @pages[index].path
          if !ignoredList.match(path)
            sorted_folders += [[path, index]]
          end
        end

        # http://stackoverflow.com/questions/3482814/sorting-list-of-string-paths-in-vb-net
        sorted_folders.sort! do |first, second|
          a           = first[0]
          b           = second[0]

          # use :: operator because gollum defines its own conflicting File class
          dir_compare = ::File.dirname(a) <=> ::File.dirname(b)

          # Sort based on directory name unless they're equal (0) in
          # which case sort based on file name.
          if dir_compare == 0
            ::File.basename(a) <=> ::File.basename(b)
          else
            dir_compare
          end
        end

        # keep track of folder depth, 0 = at root.
        cwd_array = []
        changed   = false

        # process rest of folders
        (0...sorted_folders.size).each do |i|
          page   = @pages[sorted_folders[i][1]]
          path   = page.path
          folder = ::File.dirname path

          # Flattern root folder ./Home.md -> Home.md
          if folder=="."
            folder=""
          end

          tmp_array = folder.split '/'
          cur=""
          (0...tmp_array.size).each do |index|
            cur +="/" unless cur==""
            cur += tmp_array[index]
            if cwd_array[index].nil? || changed
              html += new_sub_folder(tmp_array[index],cur)
              next
            end

            if cwd_array[index] != tmp_array[index]
              changed = true
              (cwd_array.size - index).times do
                html += end_folder tmp_array[index]
              end
              html += new_sub_folder(tmp_array[index],cur)
            end
          end

          html += new_page page
          cwd_array = tmp_array
          changed = false
        end

        result = enclose_tree html
        # result = '<ul class="folder">' + @wiki.pages.map { |p| "<li><a href=\"/#{p.url_path}\">#{p.url_path_display}</a></li>" }.join + '</ul>'
      end
    end
  end
end
