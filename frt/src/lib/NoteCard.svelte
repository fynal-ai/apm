<script lang="ts">
    export let card;
</script>
 <div class="col card-col col-md-6">
    <div class="form-check">
        <input class="form-check-input" type="radio" name={card.key} checked={card.ischecked}>
        <label class="form-check-label" for={card.key}>
            {card.programmeq}
        </label>
    </div>
    <div class="card scencard p-0" style="width: 100%;">
        <div class="remaining-credits">{card.remainingCredits}</div>
        <div class="card-body">
            <label class="card-title">
                {card.title}
            </label>
            <ui>
                {#each card.content as item}
                    <li>
                        {item}
                    </li>
                {/each}
            </ui>
            <select class="form-select form-select-sm" aria-label=".form-select-sm example">
                {#each card.options as option}
                    <option value={option}>{option}</option>
                {/each}
            </select>
        </div>
    </div>
</div>
<style scope>
    .form-check {
        margin-bottom: 1rem;
    }
    .scencard {
        position: relative;;
        border: 1px solid #e5e5e5;
        border-radius: 5px;
    }
    .card-col {
        margin-bottom: 1rem;
    }
    .card-col:last-child {
        margin-bottom: 0;
    }
    .remaining-credits {
        position: absolute;
        right: 0;
        font-size: 0.8rem;
        margin-bottom: 0.5rem;
        padding: 5px 1rem;
        background-color: #b982ec;
        color: white;
    }
    .ard-title{
        font-size: 1.5rem;
    }
</style>