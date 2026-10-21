import {Command} from 'commander'; import {readFile} from 'node:fs/promises'; import {rankCandidates} from './scanner.js'; import {generateActor,loadTarget} from './generator.js'; import {classifyFailure,maintenanceAction} from './maintenance.js'; import {validateActor} from './validate.js'; import type {Candidate} from './types.js';
const app=new Command().name('actor-factory');
app.command('scan').requiredOption('--fixture <path>').action(async o=>{const x=JSON.parse(await readFile(o.fixture,'utf8')) as Candidate[];console.log(JSON.stringify(rankCandidates(x),null,2));});
app.command('generate').requiredOption('--target <path>').option('--out <path>','output root','generated').action(async o=>console.log(await generateActor(await loadTarget(o.target),o.out)));
app.command('validate').requiredOption('--actor <path>').action(async o=>{const errs=await validateActor(o.actor);if(errs.length){console.error(errs.map(e=>`- ${e}`).join('\n'));throw new Error(`validation failed (${errs.length} problem${errs.length>1?'s':''})`);}console.log('validation: passed');});
app.command('maintain').requiredOption('--message <text>').action(o=>{const k=classifyFailure(o.message);console.log(JSON.stringify({kind:k,action:maintenanceAction(k)}));});
app.command('publish').action(()=>{throw new Error('Use the approval API with a signed, unexpired approval record; CLI publication is intentionally disabled.');});
await app.parseAsync();
