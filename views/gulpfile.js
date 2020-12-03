var gulp = require("gulp");
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var watchify = require("watchify");
var tsify = require("tsify");
var fancy_log = require("fancy-log");
var paths = {
  pages: ["src/*.html", "src/authoritative_server/room.html"],
};

var watchedBrowserify = watchify(
  browserify({
    basedir: ".",
    debug: true,
    entries: ["src/main.ts"],
    cache: {},
    packageCache: {},
  }).plugin(tsify)
);

gulp.task("copy-html", function () {
  return gulp.src(paths.pages).pipe(gulp.dest("dist"));
});

var watchedBrowserifyServer = watchify(
  browserify({
    basedir: ".",
    debug: true,
    entries: ["src/authoritative_server/game.ts"],
    cache: {},
    packageCache: {},
  }).plugin(tsify)
);


function bundle() {
  return watchedBrowserify
    .bundle()
    .on("error", fancy_log)
    .pipe(source("bundle.js"))
    .pipe(gulp.dest("dist"));
}

function serverBundle() {
  return watchedBrowserifyServer 
    .bundle()
    .on("error", fancy_log)
    .pipe(source("server.js"))
    .pipe(gulp.dest("dist"));
}
gulp.task("serverBundle", serverBundle);

gulp.task("default", gulp.series(gulp.parallel("copy-html"), gulp.parallel("serverBundle") , bundle));

watchedBrowserifyServer.on("update", serverBundle);
watchedBrowserifyServer.on("log", fancy_log);
watchedBrowserify.on("update", bundle);
watchedBrowserify.on("log", fancy_log);
