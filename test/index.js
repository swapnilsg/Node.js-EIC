const tape = require('tape')
const bent = require('bent')
const getPort = require('get-port')
const nock = require('nock');

const server = require('../')

const getJSON = bent('json');
const getBuffer = bent('buffer');

const mockRes = require('./mockresponse.json');
// Use `nock` to prevent live calls to remote services
const scope = nock('https://nodejs.org')
	.persist()
	.get('/dist/index.json')
	.reply(200, mockRes);

const context = {}

tape('setup', async function (t) {
	const port = await getPort()
	context.server = server.listen(port)
	context.origin = `http://localhost:${port}`

	t.end()
})

tape('should get dependencies', async function (t) {
	const html = (await getBuffer(`${context.origin}/dependencies`)).toString();
	t.match(html, /bent/g, 'should contain bent');
	t.match(html, /express/g, 'should contain express');
	t.match(html, /hbs/g, 'should contain hbs');
	t.end();
});
tape('should get minimum secure versions', async t => {
	const json = await getJSON(`${context.origin}/minimum-secure`);
	t.equal(json['v0'].version, "v0.10.46", "v0 version should match");
	t.equal(json['v4'].version, "v4.6.0", "v4 version should match");
	t.end();
});

tape('should get latest-releases', async t => {
	const json = await getJSON(`${context.origin}/latest-releases`);
	t.equal(json['v14'].version, "v14.10.1", "v14 version should match");
	t.equal(json['v13'].version, "v13.14.0", "v13 version should match");
	t.end();
});

tape('teardown', function (t) {
	context.server.close();
	t.end()
})
