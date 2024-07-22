<script>
    export let showModal = false;
    export let title = "";
    export let message = "";
    export let onConfirm = () => {};
    export let onCancel = () => {};

    const handleClose = () => {
        showModal = false;
        onCancel();
    };

    const handleConfirm = () => {
        showModal = false;
        onConfirm();
    };
</script>

{#if showModal}
    <div class="modal show" tabindex="-1" style="display: block;">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">{title}</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close" on:click={handleClose}>
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <p>{message}</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" on:click={handleClose}>取消</button>
                    <button type="button" class="btn btn-primary" on:click={handleConfirm}>确认</button>
                </div>
            </div>
        </div>
    </div>
    <div class="modal-backdrop show"></div>
{/if}
<style>
    .modal{
        top:30%
    }
</style>