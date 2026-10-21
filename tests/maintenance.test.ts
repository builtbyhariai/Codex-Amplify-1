import test from 'node:test';import assert from 'node:assert/strict';import {classifyFailure} from '../src/maintenance.js';test('detects blocked target',()=>assert.equal(classifyFailure('403 CAPTCHA'),'target_blocked'));test('detects drift',()=>assert.equal(classifyFailure('missing field after selector change'),'schema_drift'));
test('author is not auth',()=>assert.equal(classifyFailure('author field missing'),'unknown'));
test('429 is rate limited, not blocked',()=>assert.equal(classifyFailure('HTTP 429 Too Many Requests'),'rate_limited'));
test('401 and timeouts',()=>{assert.equal(classifyFailure('401 Unauthorized'),'auth');assert.equal(classifyFailure('request timed out'),'timeout');});
test('port 4030 is not 403',()=>assert.equal(classifyFailure('connect to :4030 failed'),'unknown'));
