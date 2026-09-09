from pathlib import Path
p=Path('client/src/main.tsx');s=p.read_text().replace("import App from './App';","import App from './App';\nimport { SessionProvider } from './components/common/SessionProvider';");s=s.replace('staleTime: 1000 * 60 * 5, // 5 minutes','staleTime: 10000,\n      refetchInterval: 15000,\n      refetchOnWindowFocus: true,');s=s.replace('<App />','<SessionProvider><App /></SessionProvider>');p.write_text(s)
p=Path('client/src/services/api.ts');s=p.read_text().replace('(response) => response,', '''(response) => {
    if (!response.data || typeof response.data !== 'object' || response.data.success !== true) {
      return Promise.reject(new Error('The API returned an invalid response. Check that the backend is deployed and connected.'));
    }
    if (response.config.method && !['get','head','options'].includes(response.config.method) && !response.config.url?.startsWith('/auth/')) {
      window.dispatchEvent(new Event('crm:data-changed'));
    }
    return response;
  },''');s=s.replace('!originalRequest._retry', 'originalRequest &&\n      !originalRequest._retry').replace("originalRequest.url !== '/auth/refresh'", "!originalRequest.url?.startsWith('/auth/')");p.write_text(s)
