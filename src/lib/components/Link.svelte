<script>
	export let link;

	$: size = (link && link.size) || '1em';
</script>

<a href={link.url}>
	<header style="font-size:{size};">{link.title}</header>
	<div>
		<img alt={link.title} src={link.icon} />
	</div>
	<footer style="font-size:{size};">{link.title}</footer>
</a>

<style>
	a {
		/* size all the same, and space between */
		flex: 1 1 0px;
		overflow: hidden;

		font-weight: 700;
		font-size: 0.25in;
		font-variant: small-caps;
		line-height: 1;
		text-decoration: none;

		background-color: var(--dark-1);
		border: 2px outset var(--primary-400);
		border-radius: 0.5rem;
		color: var(--light);
		box-shadow: 0px 0px 2px 2px black;

		min-width: 1.5in;
	}

	a:not(:first-child) {
		margin-left: 1rem;
	}

	a:hover {
		border-color: var(--compliment-400);
		box-shadow: 0 0 4px 3px var(--compliment-600);
	}

	header,
	footer {
		padding: 0.5rem 1rem;
		text-align: center;
		height: 0.4in;
	}

	div {
		height: 1in;
		width: 100%;
		justify-content: center;
		display: flex;
		background-color: white;
		border-top: 1px solid var(--primary-color);
		border-bottom: 1px solid var(--primary-color);
	}

	img {
		max-height: 1in;
		max-width: 1in;
		justify-self: center;
		padding: 0.25rem 0;
	}
</style>
