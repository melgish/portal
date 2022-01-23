<div class="modal">
	<div>
		<slot />
	</div>
</div>

<style>
	.modal {
		position: fixed;
		z-index: 1;
		left: 0;
		top: 0;
		height: 100%;
		width: 100%;
		overflow: auto;
		background-color: #00000044;
	}

	.modal > div {
		background-color: var(--dark-1);
		box-shadow: 0 0 8px 8px #00000088;
		margin: 15% auto;
		padding: 1rem;
		border: 3px solid var(--primary-400);
		border-radius: 0.5rem;
		max-width: 50%;
	}
</style>
