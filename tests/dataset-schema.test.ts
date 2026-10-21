import test from 'node:test'; import assert from 'node:assert/strict';
import {datasetSchema} from '../src/generator.js'; import type {TargetConfig} from '../src/types.js';
const cfg=(kind:'html'|'json-api')=>({source:{kind},extraction:{fields:{title:'h1',url:'a'}}}) as unknown as TargetConfig;
test('html fields are typed string',()=>{const p=(datasetSchema(cfg('html')).fields.properties as any);assert.equal(p.title.type,'string');assert.equal(p.title.title,'title');});
test('json-api fields stay untyped but titled',()=>{const p=(datasetSchema(cfg('json-api')).fields.properties as any);assert.equal(p.url.type,undefined);assert.equal(p.url.title,'url');});
