<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Icon from "fa-svelte";
  import { faSave, faTimes } from "@fortawesome/free-solid-svg-icons";

  import Modal from "$lib/components/Modal.svelte";
  import { city, theme } from "$lib/stores";
  import ThemeSelector from "$lib/components/ThemeSelector.svelte";

  /**
   * Default city to use when none is specified.
   */
  export const DEFAULT_CITY = "4163971";

  /**
   * URL for credits and settings page
   */
  export const WEATHER_URL = "https://www.openweathermap.org";

  /**
   *
   */
  export const DEFAULT_THEME = "blue";

  const dispatch = createEventDispatcher<{ close: void }>();

  let form = {
    city: $city
  };

  function close() {
    dispatch("close");
  }

  function save() {
    city.set(form.city);
    dispatch("close");
  }
</script>

<Modal>
  <fieldset>
    <legend>Theme</legend>
    <ThemeSelector />
  </fieldset>
  <fieldset>
    <legend>City</legend>
    <div>To find the ID of your city</div>
    <ol>
      <li>
        Visit
        <a href={WEATHER_URL} target="weather">{WEATHER_URL}.</a>
      </li>
      <li>Enter your city name in the search area.</li>
      <li>Choose station from list of results.</li>
      <li>
        Copy id number from URL. i.e. {`${WEATHER_URL}/city/${DEFAULT_CITY}`}
      </li>
    </ol>
    <input bind:value={form.city} />
  </fieldset>
  <footer>
    <button type="button" on:click={save} disabled={!form.city}>
      <Icon icon={faSave} />
      Save
    </button>
    <button type="button" on:click={close}>
      <Icon icon={faTimes} />
      Cancel
    </button>
  </footer>
</Modal>

<style>
  a {
    font-style: italic;
    color: var(--compliment-200);
  }

  a:hover {
    text-decoration: underline;
  }

  footer {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    margin-top: 0.5rem;
    gap: 0.5rem;
  }
</style>
