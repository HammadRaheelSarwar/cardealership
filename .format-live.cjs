const fs=require('fs');
const cp=require('child_process');
const prettier=require('prettier');
(async()=>{
 const paths=cp.execFileSync('git',['ls-files','--modified','--others','--exclude-standard'],{encoding:'utf8'}).trim().split(/\r?\n/).filter(p=>/\.(tsx?|json)$/.test(p)&&!p.startsWith('.'));
 for(const p of paths){const source=fs.readFileSync(p,'utf8');fs.writeFileSync(p,await prettier.format(source,{filepath:p,singleQuote:true,trailingComma:'es5'}));}
 console.log(`Formatted ${paths.length} source files.`);
})().catch(e=>{console.error(e);process.exit(1);});
