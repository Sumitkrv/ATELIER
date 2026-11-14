import {randomBytes,scryptSync} from 'node:crypto';
let input='';for await(const chunk of process.stdin)input+=chunk;
const password=input.replace(/\r?\n$/,'');if(password.length<12){console.error('Use a password with at least 12 characters.');process.exit(1);}
const salt=randomBytes(32);console.log(`scrypt:${salt.toString('hex')}:${scryptSync(password,salt,64).toString('hex')}`);
