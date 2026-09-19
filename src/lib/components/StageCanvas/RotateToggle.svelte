<script lang="ts">
    import { clearFreeAngle, toolState } from "../../state.svelte";
    import { uiState } from "../../ui.svelte";

    function toggleFreeRotate() {
        uiState.freeRotateMode = !uiState.freeRotateMode;
        // if (!uiState.freeRotateMode) clearFreeAngle();
        // Lo desactive por que me di cuenta que tal vez no todos quieran limpiar
        // puede que solo quieran bloquear la rotacion
    }
</script>

<button
    class="small rotate-toggle"
    class:active={uiState.freeRotateMode}
    disabled={!toolState.oriented}
    aria-label="Rotación libre"
    title="Rotación libre"
    onclick={toggleFreeRotate}
>
    ⟳
</button>