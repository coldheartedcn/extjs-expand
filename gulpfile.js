var gulp = require('gulp'), //本地安装gulp所用到的地方
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    cssmin = require('gulp-minify-css'),
    rename = require('gulp-rename');

gulp.task('genDebug', function () {
    gulp.src('src/**/*.js')
        .pipe(concat('expand-debug.js'))//合并后的文件名
        .pipe(gulp.dest('dist'));
});

gulp.task('jsmin', function () {
    gulp.src(['dist/expand-debug.js'])
        .pipe(uglify())
        .pipe(rename('expand.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('concatHomeCss', function () {
    gulp.src(['css/common/ux/admin_dashboard/**/*.css', 'css/classic/ux/admin_dashboard/**/*.css'])
        .pipe(concat('home-classic-debug.css'))
        .pipe(gulp.dest('dist'));
    gulp.src(['css/common/ux/admin_dashboard/**/*.css', 'css/modern/ux/admin_dashboard/**/*.css'])
        .pipe(concat('home-modern-debug.css'))
        .pipe(gulp.dest('dist'));
});

gulp.task('concatCss', function () {
    gulp.src(['css/clown/**/*.css'])
        .pipe(concat('expand-debug.css'))
        .pipe(gulp.dest('dist'));
});

gulp.task('minCss', function () {
    gulp.src(['dist/expand-classic-debug.css'])
        .pipe(cssmin())
        .pipe(rename('expand.css'))
        .pipe(gulp.dest('dist'));
});