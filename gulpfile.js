const del = require('del');
const gulp = require('gulp');
const logging = require('plylog');
const gulpif = require('gulp-if');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const cssSlam = require('css-slam').gulp;
const htmlMinifier = require('gulp-html-minifier');
const mergeStream = require('merge-stream');

const polymer = require('polymer-build');

logging.setVerbose();

const PolymerProject = polymer.PolymerProject;
const fork = polymer.forkStream;
const addServiceWorker = polymer.addServiceWorker;

function html() {
  return htmlMinifier({
    collapseWhitespace: true,
    removeComments: true,
    removeAttributeQuotes: false,
    removeRedundantAttributes: true,
    useShortDoctype: true,
    removeEmptyAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    removeOptionalTags: true,
    minifyCSS: true
  });
}

/**
 * Waits for the given ReadableStream
 */
function waitFor(stream) {
  return new Promise((resolve, reject) => {
    stream.on('end', resolve);
    stream.on('error', reject);
  });
}

// Clean build directory
gulp.task('clean', () => {
  return del('build');
});

gulp.task('unbundled', (cb) => {

  let project = new PolymerProject({
    root: process.cwd(),
    entrypoint: 'index.html',
    shell: 'src/app-main/app-main.html',
    extraDependencies: ['bower_components/webcomponentsjs/webcomponents-lite.js'],
    "sources": [
      "src/**/*",
      "bower.json"
    ]
  });

  let swConfig = {
    staticFileGlobs: [
      '/index.html',
      '/shell.html',
      '/source-dir/**',
    ],
    navigateFallback: '/index.html',
  };

  // process source files in the project
  let sources = project.sources()
    .pipe(project.splitHtml())
    .pipe(gulpif(['**/*.js', '!**/*.min.js'], babel({ presets: ['es2015-nostrict'] })))
    .pipe(gulpif(['**/*.js', '!**/*.min.js'], uglify({
      preserveComments: function (node, comment) {
        return /@polymerBehavior/.test(comment.value);
      }
    })))
    .pipe(project.rejoinHtml());

  // process dependencies
  let dependencies = project.dependencies()
    .pipe(project.splitHtml())
    .pipe(gulpif(['**/*.js', '!**/*.min.js'], babel({ presets: ['es2015-nostrict'] })))
    .pipe(gulpif(['**/*.js', '!**/*.min.js', '!**/test*behavior*.js'], uglify({preserveComments: function (node, comment) {
      console.log(node);
          return /@polymerBehavior/.test(comment.value);
    }})))
    .pipe(project.rejoinHtml());

  // merge the source and dependencies streams to we can analyze the project
  let allFiles = mergeStream(sources, dependencies);

  let unbundledPhase =
    fork(allFiles)
      // write to the unbundled folder
      // TODO(justinfagnani): allow filtering of files before writing
      .pipe(gulp.dest('build/unbundled'));

  // Once the unbundled build stream is complete, create a service worker for
  // the build
  let unbundledPostProcessing = waitFor(unbundledPhase).then(() => {
    return addServiceWorker({
      project: project,
      buildRoot: 'build/unbundled',
      path: 'test-custom-sw-path.js',
      swPrecacheConfig: swConfig,
    });
  });

  return unbundledPostProcessing;
});

gulp.task('bundled', (cb) => {

  let project = new PolymerProject({
    root: process.cwd() + '/build/unbundled/',
    entrypoint: 'index.html',
    shell: 'src/app-main/app-main.html',
    extraDependencies: ['bower_components/webcomponentsjs/webcomponents-lite.js'],
    "sources": [
      "src/**/*",
      "bower.json"
    ]
  });

  // let swConfig = {
  //   staticFileGlobs: [
  //     '/index.html',
  //     '/shell.html',
  //     '/source-dir/**',
  //   ],
  //   navigateFallback: '/index.html',
  // };

  // merge the source and dependencies streams to we can analyze the project
  let allFiles = mergeStream(project.sources(), project.dependencies());

  // fork the stream in case downstream transformers mutate the files
  // this fork will vulcanize the project
  let bundledPhase =
    fork(allFiles)
      .pipe(project.bundler)
      .pipe(project.splitHtml())
      // .pipe(gulpif(/\.css$/, cssSlam()))
      .pipe(gulpif('*.html', html()))
      .pipe(project.rejoinHtml())
      .pipe(gulp.dest('build/bundled'));

  // Once the bundled build stream is complete, create a service worker for the
  // // build
  // let bundledPostProcessing = waitFor(bundledPhase).then(() => {
  //   return addServiceWorker({
  //     project: project,
  //     buildRoot: 'build/bundled',
  //     swConfig: swConfig,
  //     bundled: true,
  //   });
  // });

  return bundledPhase;
});

gulp.task('default', gulp.series([
    'clean',
    'unbundled',
    'bundled'
]));