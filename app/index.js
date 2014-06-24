'use strict';

var chalk = require('chalk');
var path = require('path');
var npmName = require('npm-name');
var yeoman = require('yeoman-generator');

var ClientSideGenerator = module.exports = yeoman.generators.Base.extend({
  initializing: function () {
    this.pkg = require('../package.json');
    this.log(
      this.yeoman +
      '\nThe name of your project shouldn\'t contain "node" or "js" and' +
      '\nshould be a unique ID not already in use at search.npmjs.org.');
  },

  promptingName: function () {
    var done = this.async();

    var prompts = [{
      name: 'name',
      message: 'Module Name',
      default: path.basename(process.cwd()),
    }, {
      type: 'confirm',
      name: 'pkgName',
      message: 'The name above already exists on npm, choose another?',
      default: true,
      when: function(answers) {
        var done = this.async();

        npmName(answers.name, function (err, available) {
          if (!available) {
            done(true);
          }

          done(false);
        });
      }
    }];

    this.prompt(prompts, function (props) {
      if (props.pkgName) {
        return this.promptingName();
      }

      this.slugname = this._.slugify(props.name);
      this.safeSlugname = this.slugname.replace(
        /-+([a-zA-Z0-9])/g,
        function (g) { return g[1].toUpperCase(); }
      );

      done();
    }.bind(this));
  },

  prompting: function () {
    var cb = this.async();

    var prompts = [{
      name: 'description',
      message: 'Description',
      default: 'Client side webapp.'
    }, {
      name: 'homepage',
      message: 'Homepage'
    }, {
      name: 'license',
      message: 'License',
      default: 'MIT'
    }, {
      name: 'githubUsername',
      message: 'GitHub username'
    }, {
      name: 'authorName',
      message: 'Author\'s Name'
    }, {
      name: 'authorEmail',
      message: 'Author\'s Email'
    }, {
      name: 'authorUrl',
      message: 'Author\'s Homepage'
    }, {
      name: 'keywords',
      message: 'Key your keywords (comma to split)'
    }];

    this.currentYear = (new Date()).getFullYear();

    this.prompt(prompts, function (props) {
      if(props.githubUsername){
        this.repoUrl = 'https://github.com/' + props.githubUsername + '/' + this.slugname;
      } else {
        this.repoUrl = 'user/repo';
      }

      if (!props.homepage) {
        props.homepage = this.repoUrl;
      }

      this.keywords = props.keywords.split(',');

      this.props = props;

      cb();
    }.bind(this));
  },

  configuring: function () {
    this.config.save();
    this.copy('jshintrc', '.jshintrc');
    this.copy('gitignore', '.gitignore');

    this.template('_README.md', 'README.md');
    this.template('_gulpfile.js', 'gulpfile.js');
    this.template('_package.json', 'package.json');
  },

  writing: function () {
    this.directory('src', 'src');
  },

  install: function () {
    this.installDependencies({
      bower: false,
      skipInstall: this.options['skip-install']
    });
  }
});