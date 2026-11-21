import adapterStatic from "@sveltejs/adapter-static";
import { sveltePreprocess } from "svelte-preprocess";
import autoprefixer from "autoprefixer";

const preprocess = sveltePreprocess({
	postcss: {
		plugins: [autoprefixer]
	}
});

const config = {
	compilerOptions: {
		runes: true
	},
	preprocess,
	kit: {
		adapter: adapterStatic({ strict: false }),
		// GitHub Pages serves the site under /<repo-name>/; the deploy workflow sets BASE_PATH.
		// Empty locally, so `npm run dev` / `preview` still run at the root.
		paths: {
			base: process.env.BASE_PATH ?? ""
		}
	}
};

export default config;
