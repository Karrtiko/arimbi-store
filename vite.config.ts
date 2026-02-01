import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
	plugins: [sveltekit()],
	resolve: {
		alias: {
			'styled-system': path.resolve('./styled-system')
		}
	},
	server: {
		fs: {
			allow: ['.']
		}
	}
});
