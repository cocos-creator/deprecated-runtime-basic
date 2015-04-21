var Path = require('path');
//var fs = require('fs');
//var es = require('event-stream');
var del = require('del');

var gulp = require('gulp');
var concat = require('gulp-concat');
var gutil = require('gulp-util');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var rename = require('gulp-rename');
var uglify = require('gulp-uglifyjs');
var preprocess = require('gulp-preprocess');
//var qunit = require('gulp-qunit');
//var header = require('gulp-header');

var fb = require('gulp-fb');

var paths = {
    // source
    src: [
        'src/pixi-render-context.js',
        'src/pixi-bitmap-font.js',
        'src/pixi-text.js',
    ],
    editor: [
        'src/editor/render-context-extends.js',
        'src/editor/graphics.js',
    ],
    index: 'src/index.js',

    // output
    output: 'bin/',
    output_dev: 'bin/dev/runtime.js',
    output_min: 'bin/min/runtime.js',
    output_player_dev: 'runtime.player.dev.js',
    output_player: 'runtime.player.js'
};

/////////////////////////////////////////////////////////////////////////////
// build
/////////////////////////////////////////////////////////////////////////////

gulp.task('js-dev', function() {
    return gulp.src(paths.src.concat(paths.editor))
        .pipe(jshint({
           multistr: true,
           smarttabs: false,
           loopfunc: true,
        }))
        .pipe(jshint.reporter(stylish))
        .pipe(concat(Path.basename(paths.output_dev)))
        .pipe(fb.wrapModule(paths.index))
        .pipe(preprocess({context: { EDITOR: true, DEBUG: true, DEV: true }}))
        .pipe(gulp.dest(Path.dirname(paths.output_dev)))
        ;
});

gulp.task('js-min', function() {
    return gulp.src(paths.src.concat(paths.editor))
        .pipe(concat(Path.basename(paths.output_min)))
        .pipe(fb.wrapModule(paths.index))
        .pipe(preprocess({context: { EDITOR: true, DEV: true }}))
        .pipe(uglify({
            compress: {
                dead_code: false,
                unused: false
            }
        }))
        .pipe(gulp.dest(Path.dirname(paths.output_min)))
        ;
});

gulp.task('js-player-dev', function() {
    return gulp.src(paths.src)
        .pipe(concat(paths.output_player_dev))
        .pipe(fb.wrapModule(paths.index))
        .pipe(preprocess({context: { PLAYER: true, DEBUG: true, DEV: true }}))
        .pipe(gulp.dest(paths.output))
        ;
});

gulp.task('js-player', function() {
    return gulp.src(paths.src)
        .pipe(concat(paths.output_player))
        .pipe(fb.wrapModule(paths.index))
        .pipe(preprocess({context: { PLAYER: true }}))
        .pipe(gulp.dest(paths.output))
        ;
});

gulp.task('js-all', ['js-dev', 'js-min', 'js-player-dev', 'js-player']);

////////////////////////////////////////////////////
// clean
///////////////////////////////////////////////////

gulp.task('clean', function(cb) {
    del('bin/', cb);
});

//// doc
//gulp.task('export-api-syntax', function (done) {
//
//    // 默认所有 engine 模块都在 Fire 下面
//    var DefaultModuleHeader = "/**\n" +
//                              " * @module Fire\n" +
//                              " * @class Fire\n" +
//                              " */\n";
//    var dest = '../../utils/api/engine';
//
//    del(dest + '/**/*', { force: true }, function (err) {
//        if (err) {
//            done(err);
//            return;
//        }
//
//        gulp.src(paths.src)
//            .pipe(header(DefaultModuleHeader))
//            .pipe(gulp.dest(dest))
//            .on('end', done);
//    });
//});

// watch
gulp.task('watch', function() {
    gulp.watch(paths.src.concat(paths.index, paths.editor), ['default']).on ( 'error', gutil.log );
});

// tasks
gulp.task('min', ['js-min', 'js-player-dev', 'js-player']);
gulp.task('dev', ['js-dev', 'js-player-dev', 'js-player']);
gulp.task('default', ['dev', 'min']);
