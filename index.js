const express = require('express');
const bent = require('bent');
const getJson =bent('json');
const path = require('path');
const hbs = require('hbs');
const semverMajor = require('semver/functions/major');
const pkgJson = require('./package.json');
const semverCompare = require('semver/functions/compare');
const app = express()
const PORT = 3000

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.get('/dependencies', (req, res) => {
    const dependencies = pkgJson.dependencies;
    const formatDependencies = [];
    for ( key in dependencies) {
        formatDependencies.push(`${key} - ${dependencies[key]}`);
    }
    res.render('dependencies', {layouts: 'template', dependencies: formatDependencies});
});

app.get('/minimum-secure', async (req, res) => {
   const json = await getJson('https://nodejs.org/dist/index.json');
   const secureVersion = {};
   json.forEach( package => {
       if (package.security === true ) {
          const majorVerson = semverMajor(package.version);
          secureVersion[majorVerson] = package;
       }
   });
   const sortedKeys = Object.keys(secureVersion).sort((a,b) => a - b);
   const sortedSecureVersions = {};
       sortedKeys.forEach( key => {
        sortedSecureVersions[`v${key}`] =  secureVersion[key];
    });
    res.json(sortedSecureVersions);
});

app.get('/latest-releases', async (req, res) => {
    const json = await getJson('https://nodejs.org/dist/index.json');
    const latestReleases = {};
    json.forEach( release => {
        const majorVerson = semverMajor(release.version);
        if (latestReleases[`v${majorVerson}`] !== undefined) {
            const compare = semverCompare(release.version, latestReleases[`v${majorVerson}`].version);
            if (compare > 1)
                latestReleases[`v${majorVerson}`] = release;
        } else {
            latestReleases['v'+majorVerson] =  release;
        }
    });
    res.json(latestReleases);
});

app.listen(PORT);
module.exports = app;