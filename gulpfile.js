
//npm install gulp gulp-sass gulp-autoprefixer gulp-cssnano gulp-sourcemaps gulp-minify gulp-htmlmin --save

const gulpfile = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cssnano = require('gulp-cssnano');
const sourcemaps = require('gulp-sourcemaps');
const minify = require('gulp-minify');
const htmlmin = require('gulp-htmlmin');

const src = './src';
const dest = './public';

gulpfile.task('moveAssets', function() {
    console.log("Moving Assets!");
    return gulpfile.src([src + '/assets/**/*'])
        .pipe(gulpfile.dest(dest + '/assets/'));
});

gulpfile.task('compressHTML', function() {
    console.log("Compressing HTML!");
    return gulpfile.src(src + '/*.html')
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulpfile.dest(dest + '/'));
});

gulpfile.task('sass', function() {
    console.log("Convertion SASS!");
    return gulpfile.src(src + '/sass/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(cssnano())
        .pipe(sourcemaps.write())
        .pipe(gulpfile.dest(dest + '/assets/css'));
});

gulpfile.task('compressJS', function() {
    console.log("Compressing JS!");
    gulpfile.src(src + '/js/*.js')
        .pipe(minify())
        .pipe(gulpfile.dest(dest + '/assets/js'));
});

gulpfile.task('serve', ['sass', 'compressJS', 'compressHTML', 'moveAssets']);

gulpfile.task('default', ['serve']);