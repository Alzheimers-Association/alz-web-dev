"use strict";

var gulp = require('gulp'),
  gulpLoadPlugins = require('gulp-load-plugins'),
  browserSync = require('browser-sync'),
  del = require('del'),
  reload = browserSync.reload,
  runSequence = require('run-sequence'),
  lazypipe = require('lazypipe'),
  $ = gulpLoadPlugins();

// https://jeremenichelli.io/2016/05/a-gulp-recipe-for-timestamps/
// config =
// timestamp: new Date().getTime()

var timestamp = new Date().getTime();

// 	gulp.task('gen-timestamp', function() {
// 		timestamp = new Date().getTime();
// });

gulp.task('fileinclude', () => {
  return gulp.src('app/*.html')
    .pipe($.fileInclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest('.tmp'))
    .pipe(reload({
      stream: true
    }));
});


gulp.task("concatScripts", function () {
  return gulp.src('app/js/*.js')
    .pipe($.plumber())
    .pipe(gulp.dest('app/assets/js'))
    .pipe(gulp.dest('.tmp/js'))
    .pipe(reload({
      stream: true
    }));
});

gulp.task("scripts", ["concatScripts"], function () {
  console.log('running scripts');
	return gulp.src("app/assets/js/*.js")
		// .pipe($.replace('<!TIMESTAMP!>', timestamp))
    .pipe(gulp.dest('dist/assets/js'))
		.pipe($.uglify())
		.pipe($.rename({
      suffix: '.min'
    }))
    // .pipe($.rename({
    //   suffix: timestamp + '.min'
    // }))
    .pipe(gulp.dest('dist/assets/js'));
});

gulp.task('compileSass', function () {
  console.log('running compileSass');
  return gulp.src('app/assets/css/*.scss')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({
      browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']
    }))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('app/assets/css'))
    .pipe(gulp.dest('.tmp/css'))
    .pipe(reload({
      stream: true
    }));
});

gulp.task("styles", ["compileSass"], function () {
  console.log('running styles');
  return gulp.src(".tmp/css/*.css")
    .pipe(gulp.dest('dist/assets/css'))
    .pipe($.cssnano({
      safe: true,
      autoprefixer: false
    }))
    .pipe($.rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('dist/assets/css'));
});

function lint(files, options) {
  return gulp.src(files)
    .pipe($.eslint({
      fix: true
    }))
    .pipe(reload({
      stream: true,
      once: true
    }))
    .pipe($.eslint.format())
    .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
}

gulp.task('lint', function () {
  return lint('dist/assets/js/*.js', {
      fix: true
    })
    .pipe(gulp.dest('dist/assets/js'));
});

gulp.task('html', ['styles', 'scripts'], function () {
  console.log('running html');
  return gulp.src('app/*.html')
    .pipe($.useref())
    // .pipe($.useref({searchPath: ['.tmp', 'app/assets', '.']}))
    .pipe($.if(/\.js$/, $.uglify({
      compress: {
        drop_console: true
      }
    })))
    .pipe($.if(/\.css$/, $.cssnano({
      safe: true,
      autoprefixer: false
    })))
    .pipe($.if(/\.html$/, $.replace('"assets/', '"../ride_alz/assets/')))
    .pipe($.if(/\.html$/, $.replace('<!TIMESTAMP!>', timestamp)))
    // .pipe($.if(/\.html$/, $.if('*.html', $.fileInclude({prefix: '@@', basepath: '@file'}))))
    .pipe($.removeCode({
      production: true
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('optimizeImages', function () {
  return gulp.src('app/assets/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist/assets/images'));
});

gulp.task('watchFiles', function () {
  gulp.watch('app/assets/css/**/*.scss', ['compileSass']);
  gulp.watch('app/assets/js/*.js', ['concatScripts']);
  gulp.watch('app/*.html', ['fileinclude']);

});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('renameSources', function () {
  return gulp.src(['app/*.html'])
    .pipe($.htmlReplace({
      'js': 'app/assets/js/*.js',
      'css': 'app/assets/css/*.css'
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('build', function () {
  runSequence('clean', ['lint', 'html', 'optimizeImages', 'renameSources'], function () {
    console.log('building');
    return gulp.src('dist/**/*')
      .pipe($.size({
        title: 'build',
        gzip: true
      }));
  });
});

gulp.task('serve', ['watchFiles'], function () {
  browserSync.init({
    server: "app"
  });

  gulp.watch('app/assets/css/**/*.scss', ['compileSass']);
  gulp.watch('app/assets/js/**/*.js', ['concatScripts']).on('change', browserSync.reload);
  gulp.watch("app/assets/images/**/*", ['watchFiles']);
  gulp.watch(['app/*.html']).on('change', browserSync.reload);
});

gulp.task("default", ["clean", 'build'], function () {
  gulp.start('renameSources');
});
