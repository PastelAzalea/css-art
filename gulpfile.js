const { watch, parallel, series, task, src, dest } = require("gulp");
const webserver = require("gulp-webserver");
const autoprefixer = require("autoprefixer");
const postcss = require("postcss");
const fs = require("fs");

function serve(cb) {
  src("public").pipe(
    webserver({
      livereload: true,
      directoryListening: true,
      open: true,
      port: "80",
    })
  );
  cb();
}

var buildTask = watch([
  "src/**/*.html",
  "src/**/*.css",
  "src/*.html",
  "src/*.css",
]);

buildTask.on("change", (path, stats) => {
  const newPath = path.replace("src", "./public");
  console.log(`Change detected in ${path}, copying to ${newPath}`);

  let directories = newPath.split("/");
  directories = directories.slice(1, directories.length);

  for (let i = 0; i < directories.length; i++) {
    const tmpPath = [".", ...directories.slice(0, i)].join("/");
    console.log(`Checking path ${tmpPath}`);
    if (!fs.existsSync(tmpPath)) {
      fs.mkdirSync(tmpPath);
    }
  }

  if (path.endsWith("css")) {
    const css = fs.readFileSync(path).toString();
    postcss([autoprefixer()])
      .process(css, {
        from: path,
        to: newPath,
      })
      .then((result) => {
        fs.writeFileSync(newPath, result.css);
      })
      .catch((error) => {
        console.error("PostCSS Error: %o", error);
      });
  } else {
    src(path).pipe(dest(newPath));
  }
});

exports.serve = parallel(serve, function () {
  return buildTask;
});
