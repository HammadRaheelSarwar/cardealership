from pathlib import Path
import json
p=Path('server/src/validators/auth.validator.ts'); s=p.read_text().replace(".optional().or(z.literal(''))",'').replace('password: z.string().optional()',"password: z.string().min(1, 'Password is required')"); p.write_text(s)
p=Path('server/src/app.ts'); s=p.read_text().replace('start();',"if (require.main === module) {\n  start();\n}"); p.write_text(s)
Path('api').mkdir(exist_ok=True); Path('api/index.ts').write_text("import { app } from '../server/src/app';\nexport default app;\n")
p=Path('vercel.json'); d=json.loads(p.read_text()); d['buildCommand']='npm run build'; d['rewrites']=[{'source':'/api/:path*','destination':'/api'},{'source':'/((?!api/).*)','destination':'/index.html'}]; p.write_text(json.dumps(d,indent=2)+'\n')
