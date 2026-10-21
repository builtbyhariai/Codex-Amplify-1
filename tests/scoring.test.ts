import test from 'node:test';import assert from 'node:assert/strict';import {scoreCandidate} from '../src/scoring.js';import type {Candidate} from '../src/types.js';
const base:Candidate={id:'x',title:'x',category:'jobs',queries:['x'],buyer:'b2b',demand:[{source:'s',observedAt:'2026-08-26',value:90}],competitors:1,medianCompetitorQuality:30,estimatedValuePerThousandUsd:200,implementationDays:2,publicOrPermitted:true,tosReviewed:true,robotsReviewed:true,personalData:false,durability:90,risk:'low',lifecycle:'approved'};
test('builds strong safe opportunity',()=>assert.equal(scoreCandidate(base).decision,'build'));
test('rejects unpermitted source',()=>assert.equal(scoreCandidate({...base,publicOrPermitted:false}).decision,'reject'));
test('NaN input never builds',()=>assert.notEqual(scoreCandidate({...base,competitors:NaN,implementationDays:NaN}).decision,'build'));
test('personal data or unreviewed robots needs review',()=>{assert.equal(scoreCandidate({...base,personalData:true}).decision,'review');assert.equal(scoreCandidate({...base,robotsReviewed:false}).decision,'review');});
test('unknown risk string needs review',()=>assert.equal(scoreCandidate({...base,risk:'weird' as never}).decision,'review'));
