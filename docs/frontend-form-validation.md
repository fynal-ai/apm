# Frontend form input validation

## import JOI

In your svelte

```
import { Joi, validate, isValid } from '$lib/Joi';
import type { ValidationObject } from '$lib/Joi';

```

## Define validation schema

validation schema is defined in your svelte file.

And it must be defined with 'let' not 'const', because it will be updated by the validate() function
later.

the type of validation schema object is 'ValidationObject'.

for example: to validate three input fields 'spid', 'name' and 'contact', we may have a validation
schema defined as below, where spid must be more than 3 chars, name and contact's length must
between 3 and 30, the Error object holds the error message.

```
	let validation: ValidationObject = {
		spid: {
			schema: Joi.string()
				.min(3)
				.required()
				.error(new Error('Supplier ID should be at least 3 characters')),
		},
		name: {
			schema: Joi.string()
				.min(3)
				.max(30)
				.required()
				.error(new Error('Company name should be 3-30 characters')),
		},
		contact: {
			schema: Joi.string()
				.min(3)
				.max(30)
				.required()
				.error(new Error('Contact should be 3-30 characters'))
		},
	};
```

## Run validate

Somewhere in your codes, normally when user submit a form, call the imported validate() function,
the first param is your validation schema defined above, the second param is the object which
contains key/value.

```
    validation = validate(validation, supplier);
    if (!isValid(validation)) {
        return;
    }
```

in above example, supplier is a demo object, replace it with your own object. The above codes will
validate the supplier object's each member which names are included in 'validation', there are
"supplier.spid", "supplier.name", "supplier.contact", and return a boolean value, if the validation
failed, the validation object will be updated with error message, and the boolean value will be
false, so you can use it to control the flow of your codes.

## Display validation result

To display the validation result to the end user, simply add invalid-feeback to the html. like:

```
<input
	type="text"
	class="form-control"
	class:is-invalid={validation.spid.error}
	id="new_supplier_spid"
	bind:value={supplier.spid}
	placeholder="Supplier ID" />
<div class="invalid-feedback">{validation.spid.error?.message}</div>
```

is-invalid class only applied when 'validation.spid.error' is not undefined, and the
"invalid-feedback" will be displayed then
