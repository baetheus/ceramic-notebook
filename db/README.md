# Database migrations and schema for Keramos Data

At the outset I am using sqlite3 as the storage backend for Keramos. However,
the data storage layer and collection types defined in the application are
generic enough to work over many backends if scale is an issue later. For now,
I'll likely setup a script in flake.nix that bootstraps a database and populates
it with our default data. Aside from that the only things that exist in this
directory should be related to dbmate.
