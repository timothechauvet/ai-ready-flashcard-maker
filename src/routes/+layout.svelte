<script lang="ts">
	import '../app.css';
	import { base } from '$app/paths';
	let { children } = $props();
</script>

<div class="page-wrapper">
	<header style="background-color: var(--accent-color); color: white; padding: 1rem 0;">
		<div
			class="container"
			style="display: flex; justify-content: space-between; align-items: center;"
		>
			<a href={`${base}/`} style="color: white; font-size: 1.5rem; font-weight: 700;">YASSSF</a>
			<nav style="display: flex; gap: 1rem;">
				<a href={`${base}/explore`} style="color: white;">Explore</a>
				<a href={`${base}/upload`} style="color: white;">Upload</a>
				<a href={`${base}/settings`} style="color: white;">Settings</a>
			</nav>
		</div>
	</header>

	<main class="main-content">
		<div class="container animate-fade-in">
			{@render children()}
		</div>
	</main>
</div>
