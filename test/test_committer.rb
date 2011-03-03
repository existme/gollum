# ~*~ encoding: utf-8 ~*~
require File.expand_path(File.join(File.dirname(__FILE__), "helper"))

context "Wiki" do
  setup do
    @wiki = Gollum::Wiki.new(testpath("examples/lotr.git"))
  end

  test "normalizes commit hash" do
    commit = {:message => 'abc'}
    name  = @wiki.repo.config['user.name']
    email = @wiki.repo.config['user.email']
    committer = Gollum::Committer.new(@wiki, commit)
    assert_equal name,  committer.actor.name
    assert_equal email, committer.actor.email

    commit[:name]  = 'bob'
    commit[:email] = ''
    committer = Gollum::Committer.new(@wiki, commit)
    assert_equal 'bob',  committer.actor.name
    assert_equal email, committer.actor.email

    commit[:email] = 'foo@bar.com'
    committer = Gollum::Committer.new(@wiki, commit)
    assert_equal 'bob',  committer.actor.name
    assert_equal 'foo@bar.com', committer.actor.email
  end

  test "yield after_commit callback" do
    @path = cloned_testpath('examples/lotr.git')
    yielded = nil
    begin
      wiki = Gollum::Wiki.new(@path)
      committer = Gollum::Committer.new(wiki)
      committer.after_commit do |index, sha1|
        yielded = sha1
        assert_equal committer, index
      end

      res = wiki.write_page("Gollum", :markdown, "# Gollum", 
        :committer => committer)

      assert_equal committer, res

      sha1 = committer.commit
      assert_equal sha1, yielded
    ensure
      FileUtils.rm_rf(@path)
    end
  end
end
