# Gollum wiki installation
# Gollum wiki installation

## Installing Gollum

### Ubuntu

``` bash
sudo apt-get install ruby ruby-dev make zlib1g-dev libicu-dev build-essential git cmake
sudo gem install gollum

####### additional needed libraries
sudo gem install awesome_print oj
```

with authentication:

``` bash
####### additionally you need the following packages:
sudo apt install libssl-dev
sudo gem install gollum-rugged_adapter omnigollum omniauth-ldap
```

better to install them without ri documentations

``` sh
sudo gem install gollum gollum-rugged_adapter omnigollum omniauth-ldap --no-ri --no-rdoc
sudo gem install awsome_print oj --no-ri --no-rdoc
```

## Installing required node packages

``` bash
####### This instruction is for installing components in Ubuntu

####### Install node
####### first remove previous versions
sudo apt-get purge nodejs npm

####### use the following script to install node > 6 here we use 9
v=9
curl -sL https://deb.nodesource.com/setup_$v.x | sudo -E bash -
sudo apt-get install nodejs

npm config set proxy http://wwwproxy.axis.com:3128
npm config set https-proxy http://wwwproxy.axis.com:3128

####### This is a workaround for proxy issue when npm tries to clone some components through github
git config --global url."https://github.com/".insteadOf git://github.com/

####### Go inside the cloned csi-wiki folder and run:
npm install
```
To install the bundle do as follows:

``` bash
####### First you need to install webpack globally but inorder to do that you need to first to the above configuration again this time with sudo
sudo npm config set proxy http://wwwproxy.axis.com:3128
sudo npm config set https-proxy http://wwwproxy.axis.com:3128
sudo git config --global url."https://github.com/".insteadOf git://github.com/

####### Then you need to install webpack globally
sudo npm install webpack -g

####### Link the `node` executable correctly
sudo ln -s /usr/bin/nodejs /usr/bin/node

####### Finally run:
npm run build:prod
```
As a result of the above operation a bundle will be created in:
```
assets/scripts/editor-bundle.js
assets/scripts/viewer-bundle.js
```
## Remove npm proxy
if you need to remove http proxy for npm command you can use:
``` sh
npm config rm proxy
npm config rm https-proxy
```
## Webpack issue
``` sh
npm uninstall webpack-cli && npm install --save-dev webpack-cli@latest
```
## Update npm
``` sh
npm rebuild
npm update
```
# Bug fixes
There are some bugs that are not fixable easilly, those are listed here:
## gollum-rugged_adapter-0.4.4 : search bug
According to this [issue](https://github.com/gollum/rugged_adapter/issues/24), the only way to fix it is to apply the following diff to the file `/var/lib/gems/2.3.0/gems/gollum-rugged_adapter-0.4.4/lib/rugged_adapter/git_layer_rugged.rb`.
``` diff
@@ -167,7 +167,7 @@ module Gollum
          blob = @repo.lookup(entry[:oid])
          count = 0
          blob.content.each_line do |line|
-            next unless line.force_encoding("UTF-8").match(/#{Regexp.escape(query)}/i)
+           next unless line.force_encoding("UTF-8").scrub().match(/#{Regexp.escape(query)}/i)
            count += 1
          end
          path = options[:path] ? ::File.join(options[:path], root, entry[:name]) : "#{root}#{entry[:name]}"
```

## gollum-old jquery problem

Gollum is using an old version of jQuery (1.7.2) which is locate in `/var/lib/gems/2.5.0/gems/gollum-4.1.2/lib/gollum/public/gollum/javascript/jquery-1.7.2.min.js`. To fix the conflicts between the original jQuery version and the one which is used by other plugins such as jQueryContextMenu, you need to fix the following file:
`/var/lib/gems/2.5.0/gems/gollum-4.1.2/lib/gollum/public/gollum/javascript/gollum.js`
``` diff
@@ -40,3 +40,3 @@ 
    // ua
    $(document).ready(function() {
+       var $ = jq172;
+       
        $('#delete-link').click( function(e) { 
            var ok = confirm($(this).data('confirm')); 
```

# ToastUI editor configuration
ToastUI editor configuration is located in: 'assets/scripts/editor.js'
