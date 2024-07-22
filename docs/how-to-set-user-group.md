# How to set user group

If you need a new user account, always register it from front-end webpage.

Then, to change user's group, you may invoke mongodb command line tool directly.

Remember:

1. Every user object has a default corresponding 'employee' object.
2. The group is defined in employee object.

To add a new group TEST_GROUP to an user whose account name is 'abc', whithin mongodb command line
tool, type:

```
db.employees.findOneAndUpdate({account:'abc'}, {$push:{group: 'TEST_GROUP'}})
```

to remove a value from mongodb array, use $pull, thus, to remove TEST_GROUP from this user's group,

```
db.employees.findOneAndUpdate({account:'abc'}, {$pull:{group: 'TEST_GROUP'}})
```
