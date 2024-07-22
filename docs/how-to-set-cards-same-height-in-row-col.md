# 一行中的 card 保持同样高度

```
<div class="row card-row">
    <div class="col card-col">
        <div class="card w-100">
            ...
        </div>
        <div class="card w-100">
            ...
        </div>
    </div>
</div>

<style>
	.card-row {
		display: flex;
		flex-wrap: wrap;
	}
	.card-col {
		display: flex;
		padding: 0.5rem;
	}
</style>
```
