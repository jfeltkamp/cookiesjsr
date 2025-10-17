// https://www.npmjs.com/package/buildify
import buildify from "buildify";
// https://www.npmjs.com/package/ncp
import ncp from "ncp";
import { unlink, rmSync } from "node:fs";

import pjson from './package.json' with { type: "json" };
import mapping from './libsrc/mapping.json' with { type: "json" };

const tokens = {
  ...pjson,
  version: pjson.version,
  year: new Date().getFullYear(),
  keywords: `"${pjson.keywords.join('", "')}"`,
}

// Collect entry points by type.
const combine = {
  js: [
    'dist/index.js',
  ], css: [
    'dist/index.css',
  ]
}

// Combine React sources add license and write to library folder.
for (let src in combine) {
  let path = './dist/cookiesjsr.min.%src'
    .replace('%src',src);
  buildify()
    .concat(combine[src])
    .perform(function(content) {
      return content.replace(/\/\/# sourceMappingURL=([0-9a-z\-]*\.){1,9}map/g, '')
    })
    .wrap('./libsrc/license-wrap.tpl', {
      ...tokens,
      file_name: 'cookiesjsr.min.' + src,
    })
    .save(path);
}

// Create composer.json from template with settings from ./package.json.
buildify()
  .wrap('./libsrc/composer.json.tpl', tokens)
  .save('./composer.json');

// Create LICENSE.txt file with current information.
buildify()
  .load('./libsrc/LICENSE.txt')
  .wrap('./libsrc/license-wrap.tpl', {
    ...tokens,
    file_name: 'LICENSE.txt',
  })
  .save('./LICENSE.txt');

// Copy sources to library folder.
for (let item of mapping.maps.copy) {
  ncp(item.src, item.dest, function (err) {
    if (err) { return console.error(err); }
  });
  console.log('Copied: ', item);
}

// Remove dev stuff from dist folder.
const removeFiles = ['dist/index.js', 'dist/index.css', 'dist/index.html'];
for (let srcPath of removeFiles) {
  unlink(srcPath, err => {
    if (err) {
      console.log(err.message);
      throw err;
    }
  });
}

// Remove dev stuff from dist folder.
const removeFolders = ['dist/cookies', 'dist/js'];
for (let srcPath of removeFolders) {
  rmSync(srcPath, { recursive: true, force: true });
}