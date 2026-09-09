from pathlib import Path
p=Path('server/src/controllers/workspace.controller.ts'); s=p.read_text(); tail=s[s.index('// ─── 4. Complete Task'):]; p.write_text(Path('.workspace-controller-head.txt').read_text()+ '\n'+tail)
