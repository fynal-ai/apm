# Developer Guide

## Template

### Action KVars

An action is defined in template as:

```
<node><p>Action Name</p><div class="kvars">
ICAgICAgICAgICAgeyJkYXlzIjogMywgCiAgICAgICAgInJlYXNvbiI6ICJzZWUgcGFyZW50In0=
</div></node>
```

ICAgICAgICAgICAgeyJkYXlzIjogMywgCiAgICAgICAgInJlYXNvbiI6ICJzZWUgcGFyZW50In0=
if the Base64 coded kvars definition JSON string.
decode it, you got

```
         {"days": 3,
        "reason": "see parent"}
```

The value of vars defined in template should be used as default value
