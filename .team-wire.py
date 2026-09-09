from pathlib import Path
p=Path('server/src/routes/index.ts');s=p.read_text();s="import teamRoutes from './team.routes';\n"+s;s=s.replace("router.use('/workspace', workspaceRoutes);","router.use('/workspace', workspaceRoutes);\nrouter.use('/team',teamRoutes);");p.write_text(s)
