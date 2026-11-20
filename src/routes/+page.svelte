<script>
	import { setContext } from "svelte";
	import Meta from "$components/Meta.svelte";
	import Index from "$components/Index.svelte";
	import copy from "$data/copy.json";
	import "$utils/version.js";

	let { data } = $props();

	const { title, description, url, keywords } = copy.meta;
	setContext("copy", copy);
	setContext("data", data);
</script>

<Meta {title} {description} {url} {keywords} />
<Index />
