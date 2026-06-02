# Task Manager Screen Graph

## Simple Prototype

```txt
dashboard
  -> create task
  -> edit task
  -> delete confirm
  -> filter/search results
  -> empty state
```

## Dashboard Regions

- app header
- quick summary
- task composer
- filter/search controls
- task list
- empty state

## State Transitions

- create task: composer input -> task list item -> stats update
- complete task: active item -> completed styling -> stats update
- edit task: existing item -> edit form -> updated item
- delete task: item -> confirmation -> removed item -> empty state if needed
- filter/search: list -> filtered list -> filtered empty state

